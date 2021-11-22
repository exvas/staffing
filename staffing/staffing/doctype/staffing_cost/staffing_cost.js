// Copyright (c) 2021, jan and contributors
// For license information, please see license.txt

frappe.ui.form.on('Staffing Cost', {
	refresh: function(frm) {
        cur_frm.set_query("reference_type", () => {
            return {
                filters: [
                    ["name", "in", ["Employee", "Staff"]]
                ]
            }
        })
	},
    friday_working_costing_rate: function(frm) {
       if(cur_frm.doc.friday_working_costing_rate > cur_frm.doc.friday_working_billing_rate && cur_frm.doc.reference_type === "Staff"){
           cur_frm.doc.friday_working_costing_rate = 0
           cur_frm.refresh_field("default_cost_rate_per_hour")
           frappe.throw("Friday Working Costing Rate must be lesser than or equal to Friday Working Billing Rate")
       }
	},
    reference_type: function () {
        if(cur_frm.doc.reference_type === "Employee"){
            cur_frm.doc.staff_code = ""
            cur_frm.doc.staff_name = ""
            cur_frm.doc.naming_series = 'SC-.{employee_code}.-.YY.-'
            cur_frm.refresh_fields(["staff_code", "staff_name","naming_series"])
        } else if(cur_frm.doc.reference_type === "Staff"){
            cur_frm.doc.employee_code = ""
            cur_frm.doc.employee_name = ""
            cur_frm.doc.naming_series = 'SC-.{staff_code}.-.YY.-'
            cur_frm.refresh_fields(["employee_name", "employee_code","naming_series"])
        }
    }
});
