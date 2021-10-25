frappe.ui.form.on("Sales Invoice", {
    refresh: function () {
        cur_frm.add_custom_button(__('Timesy'),
				function() {
                    var query_args = {
                       query:"staffing.doc_events.sales_invoice.get_staffing",
                        filters: {}
                    }
					 var d = new frappe.ui.form.MultiSelectDialog({
                                doctype: "Timesy",
                                target: cur_frm,
                                setters: {},
                                add_filters_group: 1,
                                date_field: "start_date",
                                allow_child_item_selection: 1,
                                child_fieldname: "timesy_details",
                                child_columns: ["staffing_type", "staffing_project"],
                                get_query() {
                                    return {
                                        filters: { docstatus: ['!=', 2] }
                                    }
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


function add_timesy(selections, cur_frm) {
    for(var x=0;x<selections.length;x+=1){

        cur_frm.add_child("timesy", {
            timesy: selections[x]
        })
        cur_frm.refresh_field("timesy")
        frappe.db.get_doc("Timesy", selections[x])
            .then(doc => {
                 if(!check_items(doc.item, cur_frm)) {
                    cur_frm.add_child("items",{
                        item_code: doc.item,
                        qty: 1
                    })
                    cur_frm.refresh_field("items")
                 }


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