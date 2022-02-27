// Copyright (c) 2022, jan and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Mobilization Analyst Report"] = {
	"filters": [
		{
			fieldname: "from_date",
            label: __("From Date "),
            fieldtype: "Date",
		},
		{
			fieldname: "to_date",
            label: __("To Date "),
            fieldtype: "Date",
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
			"fieldname":"staff_employee",
			"label": __("Staff/Employee"),
			"fieldtype": "MultiSelectList",
			"reqd": 1,
			get_data: function(txt) {
                return [{value: 'Staff', description: 'Staff'}, {value: 'Employee', description: 'Employee'}]
            },
            on_change:function () {
				frappe.query_report.refresh()
            }
		},
		{
			fieldname: "employee",
            label: __("Employee"),
            fieldtype: "Link",
			options: "Employee",
		},
		{
			fieldname: "staff",
            label: __("Staff"),
            fieldtype: "Link",
			options: "Staff",
		},
		{
			fieldname: "supplier",
            label: __("Supplier"),
            fieldtype: "Link",
			options: "Supplier"
		},
		{
			fieldname: "customer",
            label: __("Customer"),
            fieldtype: "Link",
			options: "Customer"
		},
	]
};
