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
		{
			fieldname: "status",
            label: __("Status"),
            fieldtype: "Select",
			options: ['Draft', 'In Progress', 'Completed'],
			default: 'Completed'
		},
	]
};
