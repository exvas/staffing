// Copyright (c) 2023, jan and contributors
// For license information, please see license.txt

frappe.ui.form.on('Workforce Mobilization', {
	refresh: function(frm) {
		cur_frm.set_query("reference_type", (frm) => {
            return {
                filters: {
					name: ["in", ['Employee', 'Staff']]
                }
			}
        })
		if (cur_frm.doc.demobilization_date){
			cur_frm.set_df_property('demobilization_date','read_only', 1);
		}
		if (cur_frm.doc.release_date){
			cur_frm.set_df_property('release_date','read_only', 1);
		}
		if(frm.docstatus=1){
			if(cur_frm.doc.status!="Completed"){
				frm.add_custom_button(__("Update Demobilization Date"), () => { 
					if(! cur_frm.doc.release_date){
						cur_frm.set_df_property('demobilization_date','read_only', 0);
						cur_frm.refresh_field("demobilization_date")
						frm.set_value('status',"Standby")
					}
					
				},'Update')

				frm.add_custom_button(__("Update Release Date"), () => { 
					if(! cur_frm.doc.demobilization_date){
						cur_frm.set_df_property('release_date','read_only', 0);
						cur_frm.refresh_field("release_date")
						frm.set_value('status',"Released")
					}
					
				},'Update')
			}
		
		}

	},
	employee_code:function(frm){
		cur_frm.call({
			doc:cur_frm.doc,
			method:"get_document",
			args:{

			},
			callback:function(r){
				if (r.message){
					frm.set_value('workforce_mobilization',r.message[0].name)
				}
				else{
					frm.set_value('workforce_mobilization','')
				}
			}
		})
	},
	staff_code:function(frm){
		cur_frm.call({
			doc:cur_frm.doc,
			method:"get_document",
			args:{

			},
			callback:function(r){
				if (r.message){
					frm.set_value('workforce_mobilization',r.message[0].name)
				}
				else{
					frm.set_value('workforce_mobilization','')
				}
			}
		})
	},
	on_submit:function(frm){
		if(cur_frm.doc.workforce_mobilization){
			cur_frm.call({
				doc:cur_frm.doc,
				method:"set_complete",
				args:{
	
				},
				callback:function(r){
					
				}
			})

		console.log("validate")
		}
	}

	
	
});
