import React from "react";
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";

interface ActionCellProps {
  rowId: number;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onView?: (id: number) => void;
}

const ActionCell: React.FC<ActionCellProps> = ({
  rowId,
  onEdit,
  onDelete,
  onView,
}) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {onView && (
        <button
          onClick={() => onView(rowId)}
          className="p-2 rounded-lg hover:bg-purple/10 transition-colors"
          title="View"
        >
          <FaEye className="text-purple" />
        </button>
      )}
      {onEdit && (
        <button
          onClick={() => onEdit(rowId)}
          className="p-2 rounded-lg hover:bg-purple/10 transition-colors"
          title="Edit"
        >
          <FaEdit className="text-purple" />
        </button>
      )}
      {onDelete && (
        <button
          onClick={() => onDelete(rowId)}
          className="p-2 rounded-lg hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <FaTrashAlt className="text-red-500" />
        </button>
      )}
    </div>
  );
};

export default ActionCell;