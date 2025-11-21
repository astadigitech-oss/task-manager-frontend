"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  FileArchive,
  Download,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  Edit,
  UserPlus,
  UserMinus,
  Calendar as CalendarIcon,
  Flag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useWorkspace } from "@/context/WorkspaceContext";

interface ActivityItem {
  id: string;
  type: "status_change" | "attachment_upload" | "assignee_add" | "assignee_remove" | "date_change" | "priority_change" | "edit";
  userId: string;
  timestamp: string;
  data?: any;
}

interface TaskActivitySectionProps {
  activities: ActivityItem[];
  attachments?: File[];
  onPreviewAttachment?: (index: number) => void;
  onDownloadAttachment?: (file: File) => void;
}

export function TaskActivitySection({
  activities,
  attachments = [],
  onPreviewAttachment,
  onDownloadAttachment,
}: TaskActivitySectionProps) {
  const { members } = useWorkspace();

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "status_change":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "attachment_upload":
        return <Upload className="w-4 h-4 text-blue-600" />;
      case "assignee_add":
        return <UserPlus className="w-4 h-4 text-purple-600" />;
      case "assignee_remove":
        return <UserMinus className="w-4 h-4 text-orange-600" />;
      case "date_change":
        return <CalendarIcon className="w-4 h-4 text-cyan-600" />;
      case "priority_change":
        return <Flag className="w-4 h-4 text-red-600" />;
      case "edit":
        return <Edit className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-muted" />;
    }
  };

  const getActivityMessage = (activity: ActivityItem) => {
    const user = members.find((m) => m.id === activity.userId);
    const userName = user?.name || "Unknown User";

    switch (activity.type) {
      case "status_change":
        return (
          <>
            <span className="font-medium">{userName}</span> changed status to{" "}
            <Badge variant="outline" className="ml-1">
              {activity.data?.newStatus}
            </Badge>
          </>
        );
      case "attachment_upload":
        return (
          <>
            <span className="font-medium">{userName}</span> uploaded{" "}
            <span className="font-medium">{activity.data?.fileName}</span>
          </>
        );
      case "assignee_add":
        return (
          <>
            <span className="font-medium">{userName}</span> added{" "}
            <span className="font-medium">{activity.data?.assigneeName}</span> as assignee
          </>
        );
      case "assignee_remove":
        return (
          <>
            <span className="font-medium">{userName}</span> removed{" "}
            <span className="font-medium">{activity.data?.assigneeName}</span> from assignees
          </>
        );
      case "date_change":
        return (
          <>
            <span className="font-medium">{userName}</span> changed{" "}
            {activity.data?.field} to <span className="font-medium">{activity.data?.newDate}</span>
          </>
        );
      case "priority_change":
        return (
          <>
            <span className="font-medium">{userName}</span> changed priority to{" "}
            <Badge variant="outline" className="ml-1">
              {activity.data?.newPriority}
            </Badge>
          </>
        );
      case "edit":
        return (
          <>
            <span className="font-medium">{userName}</span> edited the task
          </>
        );
      default:
        return <span className="font-medium">{userName}</span>;
    }
  };

  const getFileIcon = (file: File) => {
    const fileType = file.type;
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "";

    if (fileType.startsWith("image/")) {
      return <ImageIcon className="w-4 h-4 text-blue-600" />;
    } else if (fileType === "application/pdf") {
      return <FileText className="w-4 h-4 text-red-600" />;
    } else if (fileExt === "xlsx" || fileExt === "xls" || fileExt === "csv") {
      return <FileSpreadsheet className="w-4 h-4 text-green-600" />;
    } else if (fileExt === "zip" || fileExt === "rar") {
      return <FileArchive className="w-4 h-4 text-orange-600" />;
    } else {
      return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-base font-semibold text-foreground">Activity</h4>

      {/* Activity Timeline */}
      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-sm text-muted text-center py-4">No activity yet</p>
        ) : (
          activities.map((activity) => {
            const user = members.find((m) => m.id === activity.userId);
            const timeAgo = formatDistanceToNow(new Date(activity.timestamp), {
              addSuffix: true,
            });

            return (
              <div key={activity.id} className="flex items-start gap-3">
                {/* User Avatar */}
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    {getActivityMessage(activity)}
                  </p>
                  <p className="text-xs text-muted mt-0.5">{timeAgo}</p>

                  {/* Attachment Preview for upload activity */}
                  {activity.type === "attachment_upload" && activity.data?.fileIndex !== undefined && attachments[activity.data.fileIndex] && (
                    <div className="mt-2 p-2 surface-elevated rounded border border-border flex items-center gap-2">
                      {getFileIcon(attachments[activity.data.fileIndex])}
                      <span className="text-xs text-foreground flex-1 truncate">
                        {attachments[activity.data.fileIndex].name}
                      </span>
                      <div className="flex items-center gap-1">
                        {onPreviewAttachment && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => onPreviewAttachment(activity.data.fileIndex)}
                            title="Preview"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        )}
                        {onDownloadAttachment && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => onDownloadAttachment(attachments[activity.data.fileIndex])}
                            title="Download"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Activity Icon */}
                <div className="p-1.5 rounded-lg surface-elevated">
                  {getActivityIcon(activity.type)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

