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
            on_change:function (d) {
				console.log(d.get_values().staff_employee)
				frappe.query_report.get_filter('staff').toggle(d.get_values().staff_employee.includes('Staff'))
				frappe.query_report.get_filter('employee').toggle(d.get_values().staff_employee.includes('Employee'))

				frappe.query_report.refresh()
            }
		},
	{
			fieldname: "employee",
            label: __("Employee"),
            fieldtype: "MultiSelectList",
			hidden:1,
			get_data: function(txt) {
				return frappe.db.get_link_options('Employee', txt);
			}
		},
{
			fieldname: "staff",
            label: __("Staff"),
            fieldtype: "MultiSelectList",
			hidden:1,
			get_data: function(txt) {
				return frappe.db.get_link_options('Staff', txt);
			}
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
