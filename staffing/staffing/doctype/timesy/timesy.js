// Copyright (c) 2021, jan and contributors
// For license information, please see license.txt
var has_si = false
var has_pi = false
var additional_salary = false
frappe.ui.form.on('Timesy', {
    start_date: function () {
        if(cur_frm.doc.timesy_details && !cur_frm.doc.timesy_details[0].date){
            cur_frm.doc.timesy_details[0].date = cur_frm.doc.start_date
            cur_frm.refresh_field("timesy_details")
        }

    },
    demobilization_date: function () {
        if(cur_frm.doc.demobilization_date){
            frappe.confirm('Update Demobilization Date in Staffing Cost?',
                    () => {

                      cur_frm.call({
                            doc: cur_frm.doc,
                            method: 'change_date',
                            args: {},
                            freeze: true,
                            freeze_message: "Changing Date...",
                             async: false,
                            callback: (r) => {
                                cur_frm.reload_doc()
                          }
                        })

        }, () => {})
        }

    },
	refresh: function(frm) {
        if(cur_frm.is_new()){
            cur_frm.doc.status = 'In Progress'
            cur_frm.refresh_field('status')
            cur_frm.doc.normal_working_hour = 8
            cur_frm.refresh_field('normal_working_hour')
        }
         cur_frm.call({
            doc: cur_frm.doc,
            method: 'check_invoices',
            args: {},
            freeze: true,
            freeze_message: "Checking Sales Order...",
            async:false,
            callback: (r) => {
                has_si= r.message[0]
                has_pi= r.message[1]
                additional_salary= r.message[2]
            }
        })
        if(cur_frm.doc.docstatus && cur_frm.doc.status === "In Progress"){
         cur_frm.add_custom_button(__('Completed'),
                                function() {
             frappe.confirm('Are you sure you want to proceed?',
                    () => {

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

                    }, () => {})
            });
        }
        if(cur_frm.doc.docstatus && cur_frm.doc.reference_type === 'Staff' && cur_frm.doc.status==='Completed'){
            if(!has_si){
                cur_frm.add_custom_button(__('Sales Invoice'), function() {
                        frappe.model.open_mapped_doc({
                            method: "staffing.staffing.doctype.timesy.timesy.generate_si",
                            frm: cur_frm
                        })
                    });
            }
                            if(!has_pi){
                 cur_frm.add_custom_button(__('Purchase Invoice'), function() {
                        frappe.model.open_mapped_doc({
                            method: "staffing.staffing.doctype.timesy.timesy.generate_pi",
                            frm: cur_frm
                        })
                    });
                            }


        }
        if(cur_frm.doc.docstatus && cur_frm.doc.reference_type === 'Employee' && cur_frm.doc.status==='Completed'){
             if(!has_si){
                cur_frm.add_custom_button(__('Sales Invoice'), function() {
                        frappe.model.open_mapped_doc({
                            method: "staffing.staffing.doctype.timesy.timesy.generate_si",
                            frm: cur_frm
                        })
                    });
            }
            if(!additional_salary){
                cur_frm.add_custom_button(__('Additional Salary'), function() {
                        frappe.model.open_mapped_doc({
                            method: "staffing.staffing.doctype.timesy.timesy.generate_as",
                            frm: cur_frm
                        })
                    });
            }

        }
         cur_frm.set_query("employee_code", () => {
            return {
                filters: {
                    status: 'Active'
                }
            }
        })
        cur_frm.set_query("staff_code", () => {
            return {
                filters: {
                    status: 'Active'
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
        cur_frm.set_query("reference_type", () => {
            return {
                filters: [
                    ["name", "in", ["Employee", "Staff"]]
                ]
            }
        })
	},
	staff_code: function(frm) {
	    if(cur_frm.doc.staff_code){
	         var obj = {
                    staff_code: cur_frm.doc.staff_code,
                    docstatus: 1,
                 status: "Active"
                }
	        get_designation(cur_frm, obj)
        } else {
	        cur_frm.doc.designation = ""
                cur_frm.refresh_field("designation")
        }

	},
    employee_code: function(frm) {
      if(cur_frm.doc.employee_code){
          var obj = {
              employee_code: cur_frm.doc.employee_code,
                    docstatus: 1,
              status: "Active"
          }
	        get_designation(cur_frm, obj)
        } else {
	        cur_frm.doc.designation = ""
	        cur_frm.doc.staffing_type = ""
	        cur_frm.doc.staffing_project = ""
            cur_frm.refresh_field("designation")
        }

	}
})
function get_designation(cur_frm, obj) {
     frappe.db.count('Staffing Cost', obj)
            .then(count => {
               if(count > 0){
                    frappe.db.get_value('Staffing Cost', obj,  ["name", "staffing_project"])
                        .then(r => {
                            let values = r.message;
                            console.log(values)
                            cur_frm.doc.staffing_type = values.name
                            cur_frm.doc.staffing_project = values.staffing_project
                            cur_frm.refresh_fields(["staffing_type","staffing_project"])


                        })

                }
            })
}
frappe.ui.form.on('Timesy Details', {
    working_hour: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn]
        if(cur_frm.doc.staffing_type){
           compute_hours(d,cur_frm)
        }
	},
    status: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn]
        if(cur_frm.doc.staffing_type){
           compute_hours(d,cur_frm)
        }
	},
    timesy_details_add: function(frm, cdt, cdn) {
      var d = locals[cdt][cdn]
        cur_frm.refresh_field(d.parentfield)
        if(d.idx > 1){
          const date = new Date(cur_frm.doc.timesy_details[d.idx - 2].date);
            var newdate = date.setDate(date.getDate() + 1);
            const new_date = new Date(newdate)
            const mm = new_date.getMonth() + 1
            const dd = new_date.getDate()
            const yy = new_date.getFullYear()
            console.log(mm + "-" + dd + "-" + yy)
            d.date = yy + "-" + mm + "-" + dd
            cur_frm.refresh_field(d.parentfield)

        } else {
            d.date = cur_frm.doc.start_date
                        cur_frm.refresh_field(d.parentfield)

        }
	}
});
function compute_hours(d,cur_frm) {
    frappe.db.get_doc("Staffing Cost", cur_frm.doc.staffing_type)
        .then(doc => {
            if(d.status === "Absent"){
                d.costing_hour = 0
                d.billing_hour = 0
                d.absent_hour = doc.absent_deduction_per_hour * d.working_hour
                d.friday_hour = 0
                d.overtime_hour = cur_frm.doc.reference_type === 'Employee' && d.working_hour > 8? (d.working_hour - cur_frm.doc.normal_working_hour) * doc.default_overtime_rate: 0

                cur_frm.refresh_field(d.parentfield)
                total_costing(cur_frm)
            } else  if(d.status === "Medical"){
                d.costing_hour = doc.default_cost_rate_per_hour * d.working_hour
                d.billing_hour = doc.default_billing_rate_per_hour * d.working_hour
                d.absent_hour = 0
                d.friday_hour =0
                d.overtime_hour = cur_frm.doc.reference_type === 'Employee' && d.working_hour > 8? (d.working_hour - cur_frm.doc.normal_working_hour) * doc.default_overtime_rate: 0


                cur_frm.refresh_field(d.parentfield)
                total_costing(cur_frm)
            } else  if(d.status === "Friday Working"){
                d.costing_hour =0
                d.billing_hour = 0
                d.absent_hour = 0
                d.friday_costing_hour = doc.friday_working_costing_rate * d.working_hour
                d.friday_billing_hour = doc.friday_working_billing_rate * d.working_hour
                d.overtime_hour = cur_frm.doc.reference_type === 'Employee' && d.working_hour > 8? (d.working_hour - cur_frm.doc.normal_working_hour) * doc.default_overtime_rate: 0


                cur_frm.refresh_field(d.parentfield)
                total_costing(cur_frm)
            } else  if(d.status === "Friday"){
                d.costing_hour = 0
                d.billing_hour = 0
                d.absent_hour = 0
                d.friday_costing_hour = 0
                d.overtime_hour = 0
                cur_frm.refresh_field(d.parentfield)
                total_costing(cur_frm)
            } else  if(d.status === "Working"){
                d.costing_hour = doc.default_cost_rate_per_hour * d.working_hour
                d.billing_hour = doc.default_billing_rate_per_hour * d.working_hour
                d.absent_hour = 0
                d.friday_hour = 0
                d.overtime_hour = cur_frm.doc.reference_type === 'Employee' && d.working_hour > 8? (d.working_hour - cur_frm.doc.normal_working_hour) * doc.default_overtime_rate: 0

                cur_frm.refresh_field(d.parentfield)
                total_costing(cur_frm)
            }

    })
}
function total_costing(cur_frm) {
    var total_costing_hour = 0
    var total_billing_hour = 0
    var total_absent_hour = 0
    var total_friday_costing_hour = 0
    var total_friday_billing_hour = 0
    var total_overtime_hour = 0
    for(var x=0;x<cur_frm.doc.timesy_details.length;x+=1){
        total_costing_hour += cur_frm.doc.timesy_details[x].costing_hour
        total_billing_hour += cur_frm.doc.timesy_details[x].billing_hour
        total_absent_hour += cur_frm.doc.timesy_details[x].absent_hour
        total_friday_costing_hour += cur_frm.doc.timesy_details[x].friday_costing_hour
        total_friday_billing_hour += cur_frm.doc.timesy_details[x].friday_billing_hour
        total_overtime_hour += cur_frm.doc.timesy_details[x].overtime_hour
    }
    cur_frm.doc.total_costing_hour = total_costing_hour
    cur_frm.doc.total_billing_hour = total_billing_hour
    cur_frm.doc.total_absent_hour = total_absent_hour
    cur_frm.doc.total_friday_costing_hour = total_friday_costing_hour
    cur_frm.doc.total_friday_billing_hour = total_friday_billing_hour
    cur_frm.doc.total_overtime_hour = total_overtime_hour
    cur_frm.refresh_fields(['total_costing_hour','total_billing_hour','total_absent_hour', 'total_friday_hour', 'total_overtime_hour', 'total_friday_costing_hour','total_friday_billing_hour'])
}