// Copyright (c) 2016, jan and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Employee Timesheet"] = {
	"filters": [
		{
			fieldname: "staffing_project",
            label: __("Company"),
            fieldtype: "Link",
			options: "Staffing Project"
		},
		{
			fieldname: "customer",
            label: __("Customer"),
            fieldtype: "Link",
			options: "Customer"
		},
		{
			fieldname: "supplier",
            label: __("Supplier"),
            fieldtype: "Link",
			options: "Supplier"
		},
		{
			"fieldname":"staff_employee",
			"label": __("Staff/Employee"),
			"fieldtype": "MultiSelectList",
			"reqd": 1,
			get_data: function(txt) {
                return [{value: 'Staff', description: 'Staff'}, {value: 'Employee', description: 'Employee'}]
            },
            on_change:function () {
				console.log("ONCHANGE")
				frappe.query_report.refresh()
            }
		},
		{
			fieldname: "employee",
            label: __("Employee"),
            fieldtype: "Link",
			options: "Employee",
			depends_on:"eval: doc.staff_employee == 'Employee'"
		},
		{
			fieldname: "staff",
            label: __("Staff"),
            fieldtype: "Link",
			options: "Staff",
			depends_on:"eval: doc.staff_employee == 'Staff'"
		},
		{
			"fieldname":"month",
			"label": __("Month"),
			"fieldtype": "MultiSelectList",
			"reqd": 1,
			get_data: function(txt) {
                return [
                	{value: 'January', description: 'January'},
					{value: 'February', description: 'February'},
					{value: 'March', description: 'March'},
					{value: 'April', description: 'April'},
					{value: 'May', description: 'May'},
					{value: 'June', description: 'June'},
					{value: 'July', description: 'July'},
					{value: 'August', description: 'August'},
					{value: 'September', description: 'September'},
					{value: 'October', description: 'October'},
					{value: 'November', description: 'November'},
					{value: 'December', description: 'December'},
				]
            }
		},
		{
			fieldname: "fiscal_year",
            label: __("Fiscal Year"),
            fieldtype: "Link",
			options: "Fiscal Year",
			default: "2021",
		},
		{
			fieldname: "status",
            label: __("Status"),
            fieldtype: "Select",
			options: ['Draft', 'Completed'],
			default: 'Completed'
		},
	]
};
