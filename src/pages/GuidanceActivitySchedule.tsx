import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import type { GuidanceActivitySchedule } from "@/types/tables";

const GuidanceActivitySchedule = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<GuidanceActivitySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] =
    useState<GuidanceActivitySchedule | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduled_date: "",
    duration_minutes: "",
    location: "",
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from("guidance_activity_schedule")
      .select("*")
      .order("scheduled_date", { ascending: true });

    if (error) {
      toast.error("Failed to fetch activity schedules");
    } else {
      setRecords(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const dataToSubmit = {
      ...formData,
      duration_minutes: parseInt(formData.duration_minutes) || null,
    };

    if (editingRecord) {
      const { error } = await supabase
        .from("guidance_activity_schedule")
        .update(dataToSubmit)
        .eq("id", editingRecord.id);

      if (error) {
        toast.error("Failed to update schedule");
      } else {
        toast.success("Schedule updated successfully");
        fetchRecords();
        handleCloseDialog();
      }
    } else {
      const { error } = await supabase
        .from("guidance_activity_schedule")
        .insert({ ...dataToSubmit, created_by: user.id });

      if (error) {
        toast.error("Failed to create schedule");
      } else {
        toast.success("Schedule created successfully");
        fetchRecords();
        handleCloseDialog();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;

    const { error } = await supabase
      .from("guidance_activity_schedule")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete schedule");
    } else {
      toast.success("Schedule deleted successfully");
      fetchRecords();
    }
  };

  const handleEdit = (record: GuidanceActivitySchedule) => {
    setEditingRecord(record);
    setFormData({
      title: record.title,
      description: record.description || "",
      scheduled_date: record.scheduled_date.slice(0, 16),
      duration_minutes: record.duration_minutes?.toString() || "",
      location: record.location || "",
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRecord(null);
    setFormData({
      title: "",
      description: "",
      scheduled_date: "",
      duration_minutes: "",
      location: "",
    });
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => navigate("/guidance")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Guidance
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <Card className="shadow-[var(--shadow-card-hover)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Guidance Activity Schedule
              </CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingRecord(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingRecord ? "Edit" : "Add"} Activity Schedule
                    </DialogTitle>
                    <DialogDescription>
                      {editingRecord ? "Update" : "Create a new"} guidance
                      activity schedule
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="scheduled_date">
                          Scheduled Date & Time
                        </Label>
                        <Input
                          id="scheduled_date"
                          type="datetime-local"
                          value={formData.scheduled_date}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              scheduled_date: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration_minutes">
                          Duration (minutes)
                        </Label>
                        <Input
                          id="duration_minutes"
                          type="number"
                          value={formData.duration_minutes}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              duration_minutes: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        {editingRecord ? "Update" : "Create"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCloseDialog}
                      >
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
                  No activity schedules found. Add your first schedule!
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Scheduled Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.title}
                        </TableCell>
                        <TableCell>
                          {format(new Date(record.scheduled_date), "PPp")}
                        </TableCell>
                        <TableCell>
                          {record.duration_minutes
                            ? `${record.duration_minutes} min`
                            : "-"}
                        </TableCell>
                        <TableCell>{record.location || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleEdit(record)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => handleDelete(record.id)}
                            >
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

export default GuidanceActivitySchedule;
