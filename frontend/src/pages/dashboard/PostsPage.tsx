import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { client } from "@/lib/api";
import DashboardLayout from "./layout";

export default function PostsPage() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["posts", page],
    queryFn: async () => {
      const res = await client.api.v1.posts.$get({
        query: {
          page: page.toString(),
          limit: limit.toString(),
        },
      });
      if (!res.ok)
        throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  const totalPages = data?.meta ? Math.ceil(data.meta.total / limit) : 0;

  const renderPaginationItems = () => {
    const items = [];
    const maxVisibleDays = 5;

    if (totalPages <= maxVisibleDays) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setPage(i)}
              isActive={page === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        );
      }
    }
    else {
      // 始终显示第一页
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => setPage(1)}
            isActive={page === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>,
      );

      if (page > 3) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }

      // 显示当前页前后的页码
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        if (i === 1 || i === totalPages)
          continue;
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setPage(i)}
              isActive={page === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        );
      }

      if (page < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }

      // 始终显示最后一页
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => setPage(totalPages)}
            isActive={page === totalPages}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return items;
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem("token");
      const res = await client.api.v1.posts[":id"].$delete({
        param: { id: id.toString() },
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok)
        throw new Error("Failed to delete post");
      return res.json();
    },
    onSuccess: () => {
      toast.success("文章已删除");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(`删除失败: ${error.message}`);
    },
  });

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            文章管理
          </h1>
          <Button onClick={() => toast.info("创建文章功能即将推出")}>
            <Plus className="w-4 h-4 mr-2" />
            新建文章
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标题</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>发布时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={5} className="h-12">
                            <div className="h-4 w-full animate-pulse bg-muted rounded" />
                          </TableCell>
                        </TableRow>
                      ))
                    )
                  : data?.data?.length === 0
                    ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            暂无文章
                          </TableCell>
                        </TableRow>
                      )
                    : (
                        data?.data?.map((post: any) => (
                          <TableRow key={post.id}>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span>{post.title || "无标题"}</span>
                                <span className="text-xs text-muted-foreground line-clamp-1">
                                  {post.slug || post.id}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {post.type === "memo" ? "便签" : "文章"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {post.isPublished
                                ? (
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none">已发布</Badge>
                                  )
                                : (
                                    <Badge variant="outline" className="text-amber-600 border-amber-200">草稿</Badge>
                                  )}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>操作</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => toast.info("编辑功能即将推出")}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    编辑
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setDeleteId(post.id)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    删除
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
              </TableBody>
            </Table>
          </CardContent>
          {!isLoading && totalPages > 1 && (
            <div className="py-4 border-t">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {renderPaginationItems()}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确定要删除这篇文章吗？</DialogTitle>
            <DialogDescription>
              此操作无法撤销。这将永久删除该文章及其相关数据。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "正在删除..." : "确定删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
