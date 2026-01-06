import { FC, useState } from "react";
import { Sort as SortType, SortDirection } from "../types/interfaces";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import WillRender from "@/app/components/will-render/WillRender";
import { SORT_KEYS } from "../constants/key.const";
import { SALE_KEYS } from "../types/key";
import { parseSortProperty } from "../utils/parseSortProperty";
import { Query } from "../hooks/useFetchSales";

interface SortProps {
  sorts: SortType[];
  loading: boolean;
  setSorts: (sorts: SortType[]) => void;
  fetchSales: (query?: Query) => void;
}

const Sort: FC<SortProps> = props => {
  const { sorts, loading, setSorts, fetchSales } = props || {};

  const [visible, setVisible] = useState(false);
  const [unsavedSorts, setUnsavedSorts] = useState(false);

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  const addSort = () => {
    setUnsavedSorts(true);
    setSorts([...sorts, { property: parseSortProperty(SORT_KEYS[SALE_KEYS.NONE]), direction: SortDirection.ASC }]);
  };

  const removeSort = () => {
    setSorts([]);
    setUnsavedSorts(true);
  };

  const deleteSort = (index: number) => {
    const newSorts = [...sorts];
    newSorts.splice(index, 1);
    setSorts(newSorts);
    setUnsavedSorts(true);
  };

  const moveUp = (index: number) => {
    const newSorts = [...sorts];
    [newSorts[index - 1], newSorts[index]] = [newSorts[index], newSorts[index - 1]];
    setSorts(newSorts);
    setUnsavedSorts(true);
  };

  const moveDown = (index: number) => {
    const newSorts = [...sorts];
    [newSorts[index + 1], newSorts[index]] = [newSorts[index], newSorts[index + 1]];
    setSorts(newSorts);
    setUnsavedSorts(true);
  };

  const setSortProperty = (index: number, property: string) => {
    const newSorts = [...sorts];
    newSorts[index].property = property;
    setSorts(newSorts);
    setUnsavedSorts(true);
  };

  const setSortDirection = (index: number, direction: SortDirection) => {
    const newSorts = [...sorts];
    newSorts[index].direction = direction;
    setSorts(newSorts);
    setUnsavedSorts(true);
  };

  const isQueryButtonDisabled =
    sorts.some(sort => sort.property === parseSortProperty(SORT_KEYS[SALE_KEYS.NONE])) || loading;

  const query = () => {
    setVisible(false);
    setUnsavedSorts(false);
    fetchSales({ sorts });
  };

  return (
    <Tippy
      className="min-w-[600px]"
      interactive
      placement="bottom-start"
      visible={visible}
      onClickOutside={hide}
      content={
        <div className="text-white rounded-md flex flex-col gap-2">
          <WillRender when={sorts.length >= 0}>
            <div className="flex flex-col gap-2">
              {sorts.map((sort, index) => (
                <div className="flex gap-2 items-center" key={index}>
                  <select
                    className="w-full bg-white text-black px-4 py-2 rounded-md"
                    value={sort.property}
                    onChange={e => setSortProperty(index, e.target.value)}
                  >
                    {Object.entries(SORT_KEYS)
                      .filter(
                        ([key, value]) =>
                          key === SALE_KEYS.NONE ||
                          parseSortProperty(value) === sort.property ||
                          !sorts.some(sort => sort.property === parseSortProperty(value)),
                      )
                      .map(([key, value]) => {
                        const valueData = parseSortProperty(value);
                        return (
                          <option key={key} value={valueData}>
                            {value}
                          </option>
                        );
                      })}
                  </select>
                  <select
                    className="w-full bg-white text-black px-4 py-2 rounded-md"
                    value={sort.direction}
                    onChange={e => setSortDirection(index, e.target.value as SortDirection)}
                  >
                    <option value={SortDirection.ASC}>{SortDirection.ASC}</option>
                    <option value={SortDirection.DESC}>{SortDirection.DESC}</option>
                  </select>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
                    disabled={index === 0}
                    onClick={() => moveUp(index)}
                  >
                    Up
                  </button>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
                    disabled={index === sorts.length - 1}
                    onClick={() => moveDown(index)}
                  >
                    Down
                  </button>
                  <button className="bg-red-500 text-white px-4 py-2 rounded-md" onClick={() => deleteSort(index)}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </WillRender>
          <button
            disabled={sorts.length >= Object.keys(SORT_KEYS).length - 1}
            onClick={addSort}
            className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            Add sort
          </button>
          <button
            disabled={sorts.length === 0}
            className="bg-red-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
            onClick={removeSort}
          >
            Remove sort
          </button>
          <button
            disabled={isQueryButtonDisabled}
            className="bg-green-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
            onClick={query}
          >
            Query
          </button>
        </div>
      }
    >
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
        onClick={visible ? hide : show}
      >
        Sort {sorts.length > 0 ? `(${sorts.length})` : ""} {unsavedSorts ? "*" : ""}
      </button>
    </Tippy>
  );
};

export default Sort;
