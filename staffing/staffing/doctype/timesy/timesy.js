// Copyright (c) 2021, jan and contributors
// For license information, please see license.txt

frappe.ui.form.on('Timesy', {
	refresh: function(frm) {
        cur_frm.set_query("staffing_type", "timesy_details", () => {
            return {
                filters: {
                    disabled: 0
                }
            }
        })
         cur_frm.set_query("staffing_project", "timesy_details", () => {
            return {
                filters: {
                    disabled: 0
                }
            }
        })
	}
});
frappe.ui.form.on('Timesy Details', {
	costing_hour: function(frm) {
        total_costing(cur_frm)
	},
    billing_hour: function(frm) {
        total_costing(cur_frm)
	},
    staffing_type: function(frm) {
        total_costing(cur_frm)
	}
});
function total_costing(cur_frm) {
    var total_costing_hour = 0
    var total_billing_hour = 0
    for(var x=0;x<cur_frm.doc.timesy_details.length;x+=1){
        total_costing_hour += cur_frm.doc.timesy_details[x].costing_hour
        total_billing_hour += cur_frm.doc.timesy_details[x].billing_hour
    }
    cur_frm.doc.total_costing_hour = total_costing_hour
    cur_frm.doc.total_billing_hour = total_billing_hour
    cur_frm.refresh_fields(['total_costing_hour','total_billing_hour'])
}