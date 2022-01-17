frappe.ui.form.on("Purchase Invoice", {
    refresh: function () {
        frappe.call({
            method: "staffing.doc_events.sales_invoice.get_timesies",
            args: {doctype: "Purchase Invoice"},
            callback: function (r) {
                cur_frm.set_query("timesy","timesy_list", () => {
                    return {
                        filters: [
                            ["name", "not in", r.message],
                            ["status", "=", "Completed"],
                            ["docstatus", "=", 1],
                        ]
                    }
                })
            }
        })
        cur_frm.add_custom_button(__('Timesy'),
				function() {
                    var query_args = {
                       query:"staffing.doc_events.sales_invoice.get_staffing",
                        filters: {}
                    }
					 var d = new frappe.ui.form.MultiSelectDialog({
                                doctype: "Timesy",
                                target: cur_frm,
                                setters: {
                                    staffing_type: "",
                                    employee_staff: null,
                                    supplier_name: null,
                                    start_date: null,
                                },
                                date_field: "start_date",
                                get_query() {
                                    return query_args;
                                },
                                action(selections) {
                                    add_timesy(selections, cur_frm)
                                    d.dialog.hide()
                                }
                            });
        }, __("Get Items From"), "btn-default");
    }
})
frappe.ui.form.on("Timesy List", {
    timesy_list_remove: function () {
        compute_grand_costing(cur_frm)
    },
    timesy: function (frm, cdt, cdn) {

        var d = locals[cdt][cdn]
        if(d.timesy){
        frappe.db.get_doc("Timesy",d.timesy)
            .then(t => {
                d.staff_name = t.reference_type === 'Staff' ? t.staff_name : t.employee_name
                cur_frm.refresh_field(d.parentfield)
            compute_grand_costing(cur_frm)
        })
        }

    }
})



function add_timesy(selections, cur_frm) {
    frappe.call({
            method: "staffing.doc_events.sales_invoice.get_timesy",
            args: {
                name: selections
            },
            callback: function (r) {
                for(var x=0;x<r.message.length;x+=1){
                    cur_frm.add_child("timesy_list", {
                        timesy: r.message[x].name,
                        staff_name: r.message[x].staff_name,
                        staffing_project: r.message[x].staffing_project,
                        total_costing_rate: r.message[x].total_billing_hour,
                    })
                    cur_frm.refresh_field("timesy_list")
                    compute_grand_costing(cur_frm)
                }
            }
        })
}
function check_items(item, cur_frm) {
        for(var x=0;x<cur_frm.doc.items.length;x+=1){
            var item_row = cur_frm.doc.items[x]
            if(item_row.item_code === item){
                item_row.qty += 1
                cur_frm.refresh_field("items")
                return true
            }
        }
        return false
}
function compute_grand_costing(cur_frm) {
    var total = 0
    for(var x=0;x<cur_frm.doc.timesy_list.length;x+=1){
       total += cur_frm.doc.timesy_list[x].total_costing_rate
    }
    cur_frm.doc.grand_costing_rate = total
    cur_frm.refresh_field("grand_costing_rate")
    if(cur_frm.doc.items.length > 0){
        cur_frm.doc.items[cur_frm.doc.items.length - 1].rate = total
        cur_frm.refresh_field('items')
    }
}