// Copyright (c) 2021, jan and contributors
// For license information, please see license.txt

frappe.ui.form.on('Timesy Batch', {
	refresh: function(frm) {
        cur_frm.set_query("staffing_project", () => {
            return {
                filters: {
                    disabled: 0
                }
            }
        })
        cur_frm.set_query("ref_doctype", () => {
            return {
                filters: [
                    ["name", "in", ["Sales Invoice", "Purchase Invoice"]]
                ]
            }
        })
	}
});
