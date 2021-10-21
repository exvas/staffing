// Copyright (c) 2021, jan and contributors
// For license information, please see license.txt

frappe.ui.form.on('Timesy', {
	refresh: function(frm) {
        if(cur_frm.doc.docstatus && cur_frm.doc.status === "In Progress"){
            frappe.confirm('Are you sure you want to proceed?',
                    () => {
                         cur_frm.add_custom_button(__('Completed'),
                                function() {
                                  cur_frm.call({
                                        doc: cur_frm.doc,
                                        method: 'change_status',
                                        args: {
                                          status: "Completed"
                                        },
                                        freeze: true,
                                        freeze_message: "Changing Status...",
                                         async: false,
                                        callback: (r) => {
                                            cur_frm.reload_doc()
                                      }
                                    })
                            });
                    }, () => {})

        }

         cur_frm.set_query("staffing_project", "timesy_details", () => {
            return {
                filters: {
                    disabled: 0
                }
            }
        })
        cur_frm.set_query("reference_type", () => {
            return {
                filters: [
                    ["name", "in", ["Employee", "Staff"]]
                ]
            }
        })
	}
});
frappe.ui.form.on('Timesy Details', {
    working_hour: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn]
        if(d.staffing_type){
            frappe.db.get_doc("Staffing Cost", d.staffing_type)
                .then(doc => {
                    d.costing_hour = doc.default_cost_rate_per_hour * d.working_hour
                    d.billing_hour = doc.default_billing_rate_per_hour * d.working_hour
                    d.absent_hour = doc.absent_deduction_per_hour * d.working_hour
                    cur_frm.refresh_field(d.parentfield)
                    total_costing(cur_frm)
            })
        }
	},
    staffing_type: function(frm, cdt, cdn) {
         var d = locals[cdt][cdn]
        if(d.staffing_type){
            frappe.db.get_doc("Staffing Cost", d.staffing_type)
                .then(doc => {
                    d.costing_hour = doc.default_cost_rate_per_hour * d.working_hour
                    d.billing_hour = doc.default_billing_rate_per_hour * d.working_hour
                    d.absent_hour = doc.absent_deduction_per_hour * d.working_hour

                    cur_frm.refresh_field(d.parentfield)
            })
        }
        total_costing(cur_frm)
	}
});
function total_costing(cur_frm) {
    var total_costing_hour = 0
    var total_billing_hour = 0
    var total_absent_hour = 0
    for(var x=0;x<cur_frm.doc.timesy_details.length;x+=1){
        total_costing_hour += cur_frm.doc.timesy_details[x].costing_hour
        total_billing_hour += cur_frm.doc.timesy_details[x].billing_hour
        total_absent_hour += cur_frm.doc.timesy_details[x].absent_hour
    }
    cur_frm.doc.total_costing_hour = total_costing_hour
    cur_frm.doc.total_billing_hour = total_billing_hour
    cur_frm.doc.total_absent_hour = total_absent_hour
    cur_frm.refresh_fields(['total_costing_hour','total_billing_hour','total_absent_hour'])
}