// Copyright (c) 2023, jan and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["New Staff Timesheet without Tax"] = {
	"filters": [
		{
			fieldname: "staffing_project",
            label: __("Staffing Project"),
            fieldtype: "Link",
			options: "Staffing Project"
		},
		{
			fieldname: "supplier",
            label: __("Supplier"),
            fieldtype: "Link",
			options: "Supplier",
			reqd: 1,
			on_change: () => {
				var supplier = frappe.query_report.get_filter_value('supplier');
				if (supplier) {
					frappe.db.get_value('Supplier', supplier, ["supplier_name"], function (value) {
						frappe.query_report.set_filter_value('supplier_name', value["supplier_name"]);
					});
		
					frappe.db.get_value('Address', { "report": 1 }, ["address_line1", "city", "country", "county", "state", "pincode"], function (value1) {
						console.log(value1); // Add this line to print the retrieved value
		
						if (value1 && value1.address_line1) {
							var address =
								value1["address_line1"] + ", " +
								value1["city"] + ", " +
								value1["county"] + ", " +
								value1["state"] + ", " +
								value1["country"] + ", " +
								value1["pincode"];
							frappe.query_report.set_filter_value('address', address);
						} else {
							frappe.query_report.set_filter_value('address', "");
						}
					});
				} else {
					frappe.query_report.set_filter_value('supplier_name', "");
					frappe.query_report.set_filter_value('address', "");
				}
            	// var supplier = frappe.query_report.get_filter_value('supplier');
				// if (supplier) {
				// 	frappe.db.get_value('Supplier', supplier, ["supplier_name"], function (value) {
				// 		frappe.query_report.set_filter_value('supplier_name', value["supplier_name"]);
				// 	});
				// 	frappe.db.get_value('Address', {"report": 1}, ["address_line1", "city","country", "county", "state", "pincode"], function (value1) {
				// 		if(value1){
				// 			frappe.query_report.set_filter_value(
				// 			'address',
				// 			value1["address_line1"] + "," +
				// 			value1["city"] + ",",
				// 			value1["county"] + ",",
				// 			value1["state"] + ",",
				// 			value1["country"] + ",",
				// 			value1["pincode"]
				// 		);
                //         }

                //     })

				// } else {
				// 	frappe.query_report.set_filter_value('supplier_name', "");
				// }
			}
		},
		{
			fieldname: "supplier_name",
            label: __("Supplier Name"),
            fieldtype: "Data",
			read_only: 1,
		},
		{
			fieldname: "address",
            label: __("Address"),
            fieldtype: "Data",
			read_only: 1,
			// hidden: 1,
		},
		{
			fieldname: "type",
            label: __("Type"),
            fieldtype: "Select",
            default: "Staff",
			options: ["Staff"]
		},
		{
			"fieldname":"staff",
			"label": __("Staff"),
			"fieldtype": "MultiSelectList",
			"depends_on":"eval: doc.type == 'Staff'",
			get_data: function(txt) {
                return frappe.db.get_link_options("Staff", txt);
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
			// default: "2021",
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
