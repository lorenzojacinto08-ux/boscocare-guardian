import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface ScheduleHistory {
  id: string;
  title: string;
  description: string;
  completed_date: string;
  notes: string;
}

const GuidanceScheduleHistory = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<ScheduleHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ScheduleHistory | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    completed_date: "",
    notes: "",
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from('guidance_schedule_history')
      .select('*')
      .order('completed_date', { ascending: false });

    if (error) {
      toast.error("Failed to fetch schedule history");
    } else {
      setRecords(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingRecord) {
      const { error } = await supabase
        .from('guidance_schedule_history')
        .update(formData)
        .eq('id', editingRecord.id);

      if (error) {
        toast.error("Failed to update history");
      } else {
        toast.success("History updated successfully");
        fetchRecords();
        handleCloseDialog();
      }
    } else {
      const { error } = await supabase
        .from('guidance_schedule_history')
        .insert({ ...formData, created_by: user.id });

      if (error) {
        toast.error("Failed to create history record");
      } else {
        toast.success("History record created successfully");
        fetchRecords();
        handleCloseDialog();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this history record?")) return;

    const { error } = await supabase
      .from('guidance_schedule_history')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete history record");
    } else {
      toast.success("History record deleted successfully");
      fetchRecords();
    }
  };

  const handleEdit = (record: ScheduleHistory) => {
    setEditingRecord(record);
    setFormData({
      title: record.title,
      description: record.description || "",
      completed_date: record.completed_date.slice(0, 16),
      notes: record.notes || "",
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRecord(null);
    setFormData({
      title: "",
      description: "",
      completed_date: "",
      notes: "",
    });
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => navigate('/guidance')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Guidance
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <Card className="shadow-[var(--shadow-card-hover)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Guidance Schedule History
              </CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingRecord(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add History
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingRecord ? "Edit" : "Add"} Schedule History</DialogTitle>
                    <DialogDescription>
                      {editingRecord ? "Update" : "Create a new"} completed activity record
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="completed_date">Completed Date & Time</Label>
                      <Input
                        id="completed_date"
                        type="datetime-local"
                        value={formData.completed_date}
                        onChange={(e) => setFormData({ ...formData, completed_date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        {editingRecord ? "Update" : "Create"}
                      </Button>
                      <Button type="button" variant="outline" onClick={handleCloseDialog}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : records.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No history records found. Add your first record!
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Completed Date</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.title}</TableCell>
                        <TableCell>{format(new Date(record.completed_date), "PPp")}</TableCell>
                        <TableCell className="max-w-xs truncate">{record.notes || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="outline" onClick={() => handleEdit(record)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="destructive" onClick={() => handleDelete(record.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
};

export default GuidanceScheduleHistory;
