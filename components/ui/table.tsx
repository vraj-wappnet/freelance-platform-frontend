// import * as React from 'react';

// import { cn } from '@/lib/utils';

// const Table = React.forwardRef<
//   HTMLTableElement,
//   React.HTMLAttributes<HTMLTableElement>
// >(({ className, ...props }, ref) => (
//   <div className="relative w-full overflow-auto">
//     <table
//       ref={ref}
//       className={cn('w-full caption-bottom text-sm', className)}
//       {...props}
//     />
//   </div>
// ));
// Table.displayName = 'Table';

// const TableHeader = React.forwardRef<
//   HTMLTableSectionElement,
//   React.HTMLAttributes<HTMLTableSectionElement>
// >(({ className, ...props }, ref) => (
//   <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
// ));
// TableHeader.displayName = 'TableHeader';

// const TableBody = React.forwardRef<
//   HTMLTableSectionElement,
//   React.HTMLAttributes<HTMLTableSectionElement>
// >(({ className, ...props }, ref) => (
//   <tbody
//     ref={ref}
//     className={cn('[&_tr:last-child]:border-0', className)}
//     {...props}
//   />
// ));
// TableBody.displayName = 'TableBody';

// const TableFooter = React.forwardRef<
//   HTMLTableSectionElement,
//   React.HTMLAttributes<HTMLTableSectionElement>
// >(({ className, ...props }, ref) => (
//   <tfoot
//     ref={ref}
//     className={cn(
//       'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
//       className
//     )}
//     {...props}
//   />
// ));
// TableFooter.displayName = 'TableFooter';

// const TableRow = React.forwardRef<
//   HTMLTableRowElement,
//   React.HTMLAttributes<HTMLTableRowElement>
// >(({ className, ...props }, ref) => (
//   <tr
//     ref={ref}
//     className={cn(
//       'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
//       className
//     )}
//     {...props}
//   />
// ));
// TableRow.displayName = 'TableRow';

// const TableHead = React.forwardRef<
//   HTMLTableCellElement,
//   React.ThHTMLAttributes<HTMLTableCellElement>
// >(({ className, ...props }, ref) => (
//   <th
//     ref={ref}
//     className={cn(
//       'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
//       className
//     )}
//     {...props}
//   />
// ));
// TableHead.displayName = 'TableHead';

// const TableCell = React.forwardRef<
//   HTMLTableCellElement,
//   React.TdHTMLAttributes<HTMLTableCellElement>
// >(({ className, ...props }, ref) => (
//   <td
//     ref={ref}
//     className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
//     {...props}
//   />
// ));
// TableCell.displayName = 'TableCell';

// const TableCaption = React.forwardRef<
//   HTMLTableCaptionElement,
//   React.HTMLAttributes<HTMLTableCaptionElement>
// >(({ className, ...props }, ref) => (
//   <caption
//     ref={ref}
//     className={cn('mt-4 text-sm text-muted-foreground', className)}
//     {...props}
//   />
// ));
// TableCaption.displayName = 'TableCaption';

// export {
//   Table,
//   TableHeader,
//   TableBody,
//   TableFooter,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableCaption,
// };

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Edit, Trash2 } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => string | number);
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  error?: string | null;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

export function Table<T>({ columns, data, isLoading, error, onEdit, onDelete }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      {isLoading && (
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
      {error && (
        <div className="p-4 text-red-500">
          Error: {error}
        </div>
      )}
      {!isLoading && !error && (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                >
                  {column.header}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={index}>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {typeof column.accessor === 'function'
                        ? String(column.accessor(item))
                        : String(item[column.accessor])}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(item)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(item)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}