// Copyright (c) 2021, jan and contributors
// For license information, please see license.txt

frappe.ui.form.on('Staff', {
	refresh: function(frm) {
        cur_frm.set_query("staffing_type",() => {
            return {
                filters: {
                    status: 'Active'
                }
            }
        })
	}
});
