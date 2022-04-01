// Copyright (c) 2016, jan and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Summary Report 2"] = {
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
			options: "Customer",
			on_change: () => {
            	var customer = frappe.query_report.get_filter_value('customer');
				if (customer) {
					frappe.db.get_value('Customer', customer, ["customer_name"], function (value) {
						frappe.query_report.set_filter_value('customer_name', value["customer_name"]);
					});
					frappe.db.get_value('Address', {"report": 1}, ["address_line1", "city","country", "county", "state", "pincode"], function (value1) {
						if(value1){
							frappe.query_report.set_filter_value(
							'address',
							value1["address_line1"] + "," +
							value1["city"] + ",",
							value1["county"] + ",",
							value1["state"] + ",",
							value1["country"] + ",",
							value1["pincode"]
						);
                        }

                    })

				} else {
					frappe.query_report.set_filter_value('customer_name', "");
				}
			}
		},
		{
			fieldname: "customer_name",
            label: __("Customer Name"),
            fieldtype: "Data",
			read_only: 1
		},
		{
			fieldname: "supplier",
            label: __("Supplier"),
            fieldtype: "Link",
			options: "Supplier"
		},
{
			fieldname: "address",
            label: __("Address"),
            fieldtype: "Data",
			hidden: 1,
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
            fieldtype: "MultiSelectList",
			depends_on:"eval: doc.staff_employee == 'Employee'",
			get_data: function(txt) {
				return frappe.db.get_link_options('Employee', txt);
			}
		},
{
			fieldname: "staff",
            label: __("Staff"),
            fieldtype: "MultiSelectList",
			options: "Staff",
			depends_on:"eval: doc.staff_employee == 'Staff'",
	get_data: function(txt) {
				return frappe.db.get_link_options('staff', txt);
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
