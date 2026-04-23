import React from "react";
import PaginationControls from "./PaginationControls";
import type { ReusableTableProps, TableColumnProps } from "../lib/interfaces";
import { LuLoaderCircle } from "react-icons/lu";

const ReusableTable: React.FC<ReusableTableProps> = ({
  columns,
  data,
  isLoading,
  error,
  currentPage,
  totalPages,
  totalItems,
  setCurrentPage,
  hasSerialNo = true,
}) => {
  const itemsPerPage = 10;

  const columnsWithSN: TableColumnProps[] = [
    ...(hasSerialNo
      ? [
          {
            title: "S/N",
            key: "sn",
            render: (_: any, index: number) => {
              const serial = (currentPage - 1) * itemsPerPage + index + 1;
              return serial.toString().padStart(3, "0");
            },
            className: "px-4 py-3 text-sm font-medium text-gray-500",
          },
        ]
      : []),

    ...columns,
  ];

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto no-scrollbar w-full">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-center">
            <thead>
              <tr className="bg-gray-50">
                {columnsWithSN.map((col, idx) => (
                  <th
                    key={col.key ?? idx}
                    className="px-4 py-3 text-sm font-semibold text-gray-600 whitespace-nowrap text-center"
                  >
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columnsWithSN.length} className="px-4 py-12">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <LuLoaderCircle className="animate-spin w-5 h-5" />
                      <span className="text-sm">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={columnsWithSN.length}
                    className="px-4 py-12 text-red-500 text-sm"
                  >
                    {typeof error === "string"
                      ? error
                      : error.message || "An error occurred"}
                  </td>
                </tr>
              ) : !Array.isArray(data) || data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columnsWithSN.length}
                    className="px-4 py-12 text-gray-500 text-sm"
                  >
                    No data found.
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors"
                  >
                    {columnsWithSN.map((col, idx) => (
                      <td
                        key={col.key ?? idx}
                        className={
                          col.className ||
                          "px-4 py-3 text-sm whitespace-nowrap text-gray-700"
                        }
                      >
                        {col.render
                          ? col.render(item, index)
                          : col.key
                            ? item[col.key as keyof typeof item]
                            : "-"}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && !error && Array.isArray(data) && data.length > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default ReusableTable;