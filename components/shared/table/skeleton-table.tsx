import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SkeletonTable = () => {
  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-25 p-2" colSpan={4}></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 4 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">
                <Skeleton className="w-full h-8 rounded" />
              </TableCell>
              <TableCell className="font-medium">
                <Skeleton className="w-full h-8 rounded" />
              </TableCell>
              <TableCell className="font-medium">
                <Skeleton className="w-full h-8 rounded" />
              </TableCell>
              <TableCell className="font-medium">
                <Skeleton className="w-full h-8 rounded" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="h-10">
            <TableCell colSpan={4}></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default SkeletonTable;
