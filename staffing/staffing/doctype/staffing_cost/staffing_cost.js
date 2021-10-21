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
	}
});
