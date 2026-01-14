import { Context, Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { Client, PageObjectResponse } from "@notionhq/client";
import { cors } from "@elysiajs/cors";
import { parseKey, parsePlainValue } from "./utils/parser";
import { SortDirection } from "./interfaces/sortDirection";
import { validateCompoundFilterDepth } from "./utils/filters";
import { isEmptyGroup, toNotionFilter } from "./utils/notionFilter";

const notion = new Client({
  auth: process?.env?.NOTION_TOKEN || "",
});

const app = new Elysia();

app.use(
  cors({
    origin: process?.env?.ALLOWED_URLS?.split(",") || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.listen({
  port: Number(process?.env?.PORT) || 3001,
  hostname: "0.0.0.0",
});

app.group("/api", api => {
  api.use(
    swagger({
      provider: "scalar",
      path: "/scalar",
      specPath: "/scalar/json",
      documentation: {
        info: { title: "My Notion API in Scalar", version: "1.0.0" },
        servers: [{ url: "/api" }],
      },
      scalarVersion: "latest",
    }),
  );

  api.use(
    swagger({
      provider: "swagger-ui",
      path: "/swagger",
      specPath: "/swagger/json",
      documentation: {
        info: { title: "My Notion API in Swagger", version: "1.0.0" },
        servers: [{ url: "/api" }],
      },
    }),
  );

  api.get("/", async () => {
    return { message: "BE API is running" };
  });

  const querySales = async (input: { sorts?: { property: string; direction: SortDirection }[]; filter?: any }) => {
    const sorts = (input.sorts || []).map(sort => ({
      property: sort.property.replaceAll("_", " "),
      direction: sort.direction === SortDirection.ascending ? SortDirection.ascending : SortDirection.descending,
    }));

    const maxDepth = Number(process?.env?.MAX_FILTER_DEPTH) || 2;
    if (input.filter) validateCompoundFilterDepth(input.filter, maxDepth);

    const filter = input.filter && !isEmptyGroup(input.filter) ? toNotionFilter(input.filter) : undefined;

    console.log(JSON.stringify(filter, null, 2));

    const data = await notion.dataSources.query({
      data_source_id: process?.env?.NOTION_DATA_SOURCE_ID || "",
      sorts: sorts.length > 0 ? sorts : undefined,
      filter,
      page_size: 100,
    });

    const { results } = data || {};
    const rows = (results || []).map(item => {
      const { properties } = item as PageObjectResponse;
      return Object.entries(properties).reduce((acc, [key, value]) => {
        const parsedKey = parseKey(key);
        const parsedPlainValue = parsePlainValue(value?.type, value);
        acc[parsedKey] = { ...value, plainValue: parsedPlainValue, columnName: key };
        return acc;
      }, {} as Record<string, any>);
    });

    return rows;
  };

  api.post("/sales", async (ctx: Context) => {
    try {
      const body = (ctx.body || {}) as any;
      return await querySales({ sorts: body.sorts || [], filter: body.filter });
    } catch (error) {
      return error;
    }
  });

  return api;
});

console.log(`Server is running at ${app.server?.hostname}:${app.server?.port}`);
