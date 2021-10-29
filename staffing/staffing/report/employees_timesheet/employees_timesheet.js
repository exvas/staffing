// Copyright (c) 2016, jan and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Employees Timesheet"] = {
	"filters": [
		{
			fieldname: "staffing_project",
            label: __("Staffing Project"),
            fieldtype: "Link",
			options: "Staffing Project"
		},
		{
			fieldname: "type",
            label: __("Type"),
            fieldtype: "Select",
            default: "Employee",
			options: ['','Employee', "Staff"]
		},
		{
			fieldname: "staff",
            label: __("Staff"),
            fieldtype: "Link",
			options: "Staff",
			depends_on:"eval: doc.type == 'Staff'"
		},
		{
			fieldname: "employee",
            label: __("Employee"),
            fieldtype: "Link",
			options: "Employee",
			depends_on:"eval: doc.type == 'Employee'"
		},
		{
			fieldname: "month",
            label: __("Month"),
            fieldtype: "Select",
            default: "January",
			options: ['January', "February", "March","April", "May", "June", "July", "August", "September", "October", "November", "December"]
		},
		{
			fieldname: "fiscal_year",
            label: __("Fiscal Year"),
            fieldtype: "Link",
			options: "Fiscal Year",
			default: "2021",
		},
	]
};
