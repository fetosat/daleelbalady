import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search,
  UserPlus,
  Filter,
  MoreHorizontal,
  Edit,
  Trash,
  Shield,
  ShieldAlert,
  RefreshCw,
  UserCheck,
  UserX
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { getAdminUsers, updateAdminUser, type AdminUser } from "@/api/admin";
import { useToast } from "@/components/ui/use-toast";

export default function Users() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchUsers = async (page: number = 1, search?: string, role?: string, status?: string) => {
    try {
      setIsLoading(page === 1);
      setIsRefreshing(page !== 1);
      const response = await getAdminUsers(
        page, 
        20, 
        search, 
        role === 'all' ? undefined : role, 
        status === 'all' ? undefined : status
      );
      setUsers(response.users);
      setTotalPages(response.pagination.pages);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSearch = () => {
    fetchUsers(1, searchQuery, roleFilter === 'all' ? undefined : roleFilter, statusFilter === 'all' ? undefined : statusFilter);
  };

  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(role);
    fetchUsers(1, searchQuery, role === 'all' ? undefined : role, statusFilter === 'all' ? undefined : statusFilter);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    fetchUsers(1, searchQuery, roleFilter === 'all' ? undefined : roleFilter, status === 'all' ? undefined : status);
  };

  const handleUpdateUser = async (userId: string, updateData: { role?: string; isVerified?: boolean; action?: 'delete' | 'restore' }) => {
    try {
      setUpdatingUserId(userId);
      await updateAdminUser(userId, updateData);
      toast({
        title: "Success",
        description: "User updated successfully"
      });
      // Refresh users
      fetchUsers(currentPage, searchQuery, roleFilter === 'all' ? undefined : roleFilter, statusFilter === 'all' ? undefined : statusFilter);
    } catch (err) {
      console.error('Error updating user:', err);
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page, searchQuery, roleFilter === 'all' ? undefined : roleFilter, statusFilter === 'all' ? undefined : statusFilter);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => fetchUsers()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6 bg-background"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('admin.userManagement')}</h1>
          <p className="text-muted-foreground">{t('admin.userManagementDesc')}</p>
        </div>
        <Button className="bg-green-primary hover:bg-green-primary/90">
          <UserPlus className="mr-2 h-4 w-4" />
          {t('admin.addUser')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.usersList')}</CardTitle>
          <CardDescription>{t('admin.usersListDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('admin.searchUsers')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-8"
                />
              </div>
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              
              <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="provider">Provider</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Deleted</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={() => fetchUsers(currentPage, searchQuery, roleFilter === 'all' ? undefined : roleFilter, statusFilter === 'all' ? undefined : statusFilter)} 
                variant="outline" 
                size="icon"
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.name')}</TableHead>
                  <TableHead>{t('admin.email')}</TableHead>
                  <TableHead>{t('admin.role')}</TableHead>
                  <TableHead>{t('admin.status')}</TableHead>
                  <TableHead>{t('admin.joinDate')}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center py-8">
                        <UserX className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">
                          {searchQuery || roleFilter !== 'all' || statusFilter !== 'all' 
                            ? 'No users found matching your filters.'
                            : 'No users found.'
                          }
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'}
                        className="font-medium"
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={user.isVerified ? 'default' : 'secondary'}
                          className="font-medium"
                        >
                          {user.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                        </Badge>
                        <Badge
                          variant={user.deletedAt ? 'destructive' : 'default'}
                          className="font-medium"
                        >
                          {user.deletedAt ? 'DELETED' : 'ACTIVE'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            disabled={updatingUserId === user.id}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{t('admin.actions')}</DropdownMenuLabel>
                          
                          <Select onValueChange={(role) => handleUpdateUser(user.id, { role })}>
                            <SelectTrigger className="w-full mb-2">
                              <SelectValue placeholder="Change Role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CUSTOMER">Customer</SelectItem>
                              <SelectItem value="PROVIDER">Provider</SelectItem>
                              <SelectItem value="SHOP_OWNER">Shop Owner</SelectItem>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          {!user.isVerified && (
                            <DropdownMenuItem 
                              onClick={() => handleUpdateUser(user.id, { isVerified: true })}
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              {t('admin.verify')}
                            </DropdownMenuItem>
                          )}
                          
                          {user.deletedAt ? (
                            <DropdownMenuItem 
                              onClick={() => handleUpdateUser(user.id, { action: 'restore' })}
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Restore User
                            </DropdownMenuItem>
                          ) : (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  {t('admin.delete')}
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {user.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleUpdateUser(user.id, { action: 'delete' })}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isRefreshing}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isRefreshing}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
          
        </CardContent>
      </Card>
    </motion.div>
  );
}
