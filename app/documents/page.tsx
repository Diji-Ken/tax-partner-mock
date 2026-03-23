"use client";

import React, { useState, useMemo } from "react";
import { folders, files, DocumentFolder } from "@/data/documents";
import { Folder, FolderOpen as FolderOpenIcon, FileText, FileSpreadsheet, ChevronRight, ChevronDown, ExternalLink, Share2, Shield } from "lucide-react";

const fileIcon: Record<string, React.ElementType> = {
  pdf: FileText,
  xlsx: FileSpreadsheet,
  csv: FileSpreadsheet,
  doc: FileText,
};

export default function DocumentsPage() {
  const [selectedFolder, setSelectedFolder] = useState<string>("c1-2026-monthly");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["c1", "c1-2026"]));

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSelectedFolder(id);
  };

  const rootFolders = useMemo(() => folders.filter((f) => f.parentId === null), []);

  const getChildren = (parentId: string) => folders.filter((f) => f.parentId === parentId);

  const folderFiles = useMemo(() => files.filter((f) => f.folderId === selectedFolder), [selectedFolder]);

  const renderFolder = (folder: DocumentFolder, depth: number = 0) => {
    const children = getChildren(folder.id);
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolder === folder.id;

    return (
      <div key={folder.id}>
        <button
          onClick={() => toggleFolder(folder.id)}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-lg transition-colors ${isSelected ? "bg-orange-50 text-orange-700" : ""}`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
        >
          {children.length > 0 ? (
            isExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />
          ) : (
            <span className="w-[14px]" />
          )}
          {isExpanded ? (
            <FolderOpenIcon size={16} className="text-orange-500" />
          ) : (
            <Folder size={16} className="text-gray-400" />
          )}
          <span className="truncate">{folder.name}</span>
        </button>
        {isExpanded && children.map((child) => renderFolder(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">ドキュメント</h2>

      <div className="grid grid-cols-4 gap-5">
        {/* Folder Tree */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 col-span-1">
          <h3 className="text-sm font-semibold text-[#64748b] mb-3 px-3">フォルダ</h3>
          <div className="space-y-0.5">
            {rootFolders.map((f) => renderFolder(f))}
          </div>
        </div>

        {/* File List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 col-span-3 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold">ファイル一覧</h3>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1.5">
                <ExternalLink size={14} />
                Google Driveで開く
              </button>
              <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1.5">
                <Share2 size={14} />
                クライアントと共有
              </button>
            </div>
          </div>
          {folderFiles.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-sm text-[#64748b]">
                  <th className="px-4 py-3 font-medium">ファイル名</th>
                  <th className="px-4 py-3 font-medium">種別</th>
                  <th className="px-4 py-3 font-medium">更新日</th>
                  <th className="px-4 py-3 font-medium">サイズ</th>
                  <th className="px-4 py-3 font-medium">電帳法</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {folderFiles.map((f) => {
                  const Icon = fileIcon[f.type] || FileText;
                  return (
                    <tr key={f.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Icon size={16} className="text-[#64748b]" />
                          <span className="text-sm">{f.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{f.category}</td>
                      <td className="px-4 py-3 text-sm">{f.updatedAt}</td>
                      <td className="px-4 py-3 text-sm">{f.size}</td>
                      <td className="px-4 py-3">
                        {f.electronicBookCompliant ? (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">
                            <Shield size={10} />
                            対応済
                          </span>
                        ) : (
                          <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">未対応</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-sm text-[#64748b]">フォルダを選択してください</div>
          )}
        </div>
      </div>
    </div>
  );
}
