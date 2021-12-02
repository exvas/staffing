// Copyright (c) 2016, jan and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Staff Timesheet"] = {
	"filters": [
		{
			fieldname: "staffing_project",
            label: __("Company"),
            fieldtype: "Link",
			options: "Staffing Project"
		},
		{
			fieldname: "supplier",
            label: __("Supplier"),
            fieldtype: "Link",
			options: "Supplier",
			reqd: 1
		},
		{
			fieldname: "type",
            label: __("Type"),
            fieldtype: "Select",
            default: "Staff",
			options: ["Staff"]
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
