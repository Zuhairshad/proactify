"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Download, Upload, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ImportExportButtons({ type }: { type: "risk" | "issue" }) {
    const [isImporting, setIsImporting] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const { toast } = useToast();

    const handleDownloadTemplate = () => {
        const templateUrl = `/templates/${type}_import_template.csv`;
        const link = document.createElement("a");
        link.href = templateUrl;
        link.download = `${type}_import_template.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
            title: "Template Downloaded",
            description: `${type === "risk" ? "Risk" : "Issue"} import template has been downloaded.`,
        });
    };

    const handleExport = async () => {
        try {
            const response = await fetch(`/api/${type}s/export`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${type}s_export_${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast({
                title: "Export Successful",
                description: `All ${type}s have been exported to CSV.`,
            });
        } catch (error) {
            toast({
                title: "Export Failed",
                description: "Failed to export data. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(`/api/${type}s/import`, {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                toast({
                    title: "Import Successful",
                    description: result.message,
                });
                setImportDialogOpen(false);
                // Refresh the page to show new data
                window.location.reload();
            } else {
                toast({
                    title: "Import Failed",
                    description: result.error || "Failed to import data",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Import Failed",
                description: "An error occurred during import. Please check your file format.",
                variant: "destructive",
            });
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {/* Download Template Button */}
            <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                className="gap-2"
            >
                <FileSpreadsheet className="h-4 w-4" />
                Download Template
            </Button>

            {/* Export Button */}
            <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="gap-2"
            >
                <Download className="h-4 w-4" />
                Export
            </Button>

            {/* Import Button with Dialog */}
            <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="default" size="sm" className="gap-2">
                        <Upload className="h-4 w-4" />
                        Import
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import {type === "risk" ? "Risks" : "Issues"}</DialogTitle>
                        <DialogDescription>
                            Upload a CSV file to bulk import {type === "risk" ? "risks" : "issues"}.
                            Make sure to use the provided template format.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-muted-foreground">
                                1. Download the template using the "Download Template" button
                            </p>
                            <p className="text-sm text-muted-foreground">
                                2. Fill in your data following the example format
                            </p>
                            <p className="text-sm text-muted-foreground">
                                3. Upload the completed CSV file below
                            </p>
                        </div>
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleImport}
                                disabled={isImporting}
                                className="hidden"
                                id={`file-upload-${type}`}
                            />
                            <label
                                htmlFor={`file-upload-${type}`}
                                className="cursor-pointer flex flex-col items-center gap-2"
                            >
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                    {isImporting ? "Importing..." : "Click to upload CSV file"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    CSV files only
                                </span>
                            </label>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
