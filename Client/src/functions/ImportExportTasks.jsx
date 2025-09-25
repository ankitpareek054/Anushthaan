import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

import autoTable from 'jspdf-autotable';
import "jspdf-autotable";
import dayjs from "dayjs";
import { useState } from 'react';
export const handleImport = (event,setImportTasks) => {
    
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      fetch('http://localhost:5000/api/importTasks', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: json }),
      })
      .then(response => response.json())
      .then(data => {
        alert('Tasks imported successfully');
        setImportTasks(data.importedTasks);
      })
     
      .catch(error => alert(`Error importing tasks: ${error.message}`));
    };
    reader.readAsBinaryString(file);
  };


  export const handleExportPDF = (exportTasks, projectTitle) => {
    const doc = new jsPDF({ orientation: "landscape" }); // Landscape mode
    doc.setFontSize(10);
  
    // Add logo (from public folder)
    const logo = "/SprintlyyLogo_2.png";
    doc.addImage(logo, "PNG", 0, 0, 42, 18);
  
    // Add heading (centered)
    const pageWidth = doc.internal.pageSize.getWidth();
    const title = projectTitle + " - Task List";
    doc.setFontSize(22);
    const textWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - textWidth) / 2, 22);
  
    // Define table columns
    const columns = [
      { header: "ID", dataKey: "_id" },
      { header: "Title", dataKey: "title" },
      { header: "Description", dataKey: "description" },
      { header: "Project Name", dataKey: "projectName" },
      { header: "Assignee", dataKey: "assignee" },
      { header: "Status", dataKey: "status" },
      { header: "Priority", dataKey: "priority" },
      { header: "Start Date", dataKey: "startDate" },
      { header: "End Date", dataKey: "endDate" },
      { header: "Created By", dataKey: "createdBy" },
      { header: "Comments", dataKey: "comments" },
      { header: "Created At", dataKey: "createdAt" },
    ];
  
    // Format and sort tasks
    const formattedTasks = exportTasks
      .map((task) => ({
        ...task,
        comments: (task.comments || []).join(", "),
        startDate: dayjs(task.startDate).format("YYYY-MM-DD"),
        endDate: dayjs(task.endDate).format("YYYY-MM-DD"),
        createdAt: dayjs(task.createdAt).format("YYYY-MM-DD HH:mm"),
      }))
      .sort((a, b) => {
        const priorityOrder = { High: 1, Medium: 2, Low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  
    // Generate the table using autoTable
    autoTable(doc, {
      columns,
      body: formattedTasks,
      startY: 35,
      margin: { left: 1 },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
      columnStyles: {
        _id: { cellWidth: 25 },
        title: { cellWidth: 30 },
        description: { cellWidth: 50 },
        projectName: { cellWidth: 30 },
        assignee: { cellWidth: 30 },
        status: { cellWidth: 25 },
        priority: { cellWidth: 20 },
        startDate: { cellWidth: 30 },
        endDate: { cellWidth: 30 },
        createdBy: { cellWidth: 30 },
        comments: { cellWidth: 50 },
        createdAt: { cellWidth: 35 },
      },
    });
  
    // Save the PDF
    doc.save("taskData.pdf");
  };
  

  

  export const handleExportExcel = (exportTasks) => {
    const formattedData = exportTasks.map(task => ({
      ...task,
      comments: (task.comments || []).join(', '),
    }));
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const excelFile = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    FileSaver.saveAs(excelFile, 'taskData.xlsx');
  };