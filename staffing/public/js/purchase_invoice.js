frappe.ui.form.on("Purchase Invoice", {
    refresh: function () {
        cur_frm.add_custom_button(__('Timesy'),
				function() {
                    var query_args = {
                       query:"staffing.doc_events.purchase_invoice.get_staffing",
                        filters: {}
                    }
					 var d = new frappe.ui.form.MultiSelectDialog({
                                doctype: "Timesy",
                                target: cur_frm,
                                setters: {
                                    staffing_project: null,
                                    staffing_type: null,
                                    customer_name: null,
                                },
                                add_filters_group: 1,
                                date_field: "start_date",
                                get_query() {
                                    return query_args;
                                },
                                action(selections) {
                                    console.log(selections)
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
    }
})

function add_timesy(selections, cur_frm) {
    for(var x=0;x<selections.length;x+=1){

        frappe.db.get_doc("Timesy", selections[x])
            .then(doc => {
                cur_frm.add_child("timesy_list", {
                    timesy: doc.name,
                    staff_name: doc.staff_name,
                    staffing_project: doc.staffing_project,
                    total_costing_rate: doc.total_costing_hour,
                })
                cur_frm.refresh_field("timesy_list")
                compute_grand_costing(cur_frm)
        })
    }
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
        cur_frm.doc.items[0].rate = total
        cur_frm.refresh_field('items')
    }
}