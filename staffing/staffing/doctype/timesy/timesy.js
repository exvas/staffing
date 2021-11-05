// Copyright (c) 2021, jan and contributors
// For license information, please see license.txt
var has_si = false
var has_pi = false
var additional_salary = false
var type = ""
frappe.ui.form.on('Monthly Timesheet', {
    type: function (frm, cdt, cdn) {
        var d = locals[cdt][cdn]
        var from_date = new Date(cur_frm.doc.start_date)
        var end_date = new Date(cur_frm.doc.end_date)
        var number_of_days = (new Date(end_date - from_date)).getDate()

        if(d.type === 'Working Days'){
            type = ""
          d.number = number_of_days
          cur_frm.refresh_field("monthly_timesheet")
        }

    },
    number: function (frm, cdt, cdn) {
        var d = locals[cdt][cdn]
        var from_date = new Date(cur_frm.doc.start_date)
        var end_date = new Date(cur_frm.doc.end_date)
        var number_of_days = (new Date(end_date - from_date)).getDate()

        if (d.type !== "Working Days"){
           compute_working_days(cur_frm,number_of_days, d)
        }
    },
    monthly_timesheet_remove: function (frm, cdt, cdn) {
        var d = locals[cdt][cdn]
        var from_date = new Date(cur_frm.doc.start_date)
        var end_date = new Date(cur_frm.doc.end_date)
        var number_of_days = (new Date(end_date - from_date)).getDate()
        cur_frm.refresh_field("monthly_timesheet")
        if (type !== "Working Days"){
           compute_working_days(cur_frm,number_of_days, d)
        }
    },
    before_monthly_timesheet_remove: function (frm, cdt, cdn) {
        var d = locals[cdt][cdn]
       type = d.type
    },
    working_hour: function (frm, cdt, cdn) {
        var d = locals[cdt][cdn]
        var from_date = new Date(cur_frm.doc.start_date)
        var end_date = new Date(cur_frm.doc.end_date)
        var number_of_days = (new Date(end_date - from_date)).getDate()
       compute_working_days(cur_frm,number_of_days, d)
    },
})
function compute_working_days(cur_frm,number_of_days, d) {
    var working_days = number_of_days
    var fridays = 0
    var w_fridays = 0
    var absent = 0
    var h_working = 0
    var holiday = 0
    console.log(cur_frm.doc.monthly_timesheet)
    for(var x=0;x<cur_frm.doc.monthly_timesheet.length;x+=1){
        if(cur_frm.doc.monthly_timesheet[x].type === 'Fridays'){
           fridays = cur_frm.doc.monthly_timesheet[x].number
        } else if(cur_frm.doc.monthly_timesheet[x].type === 'Working Fridays'){
           w_fridays = cur_frm.doc.monthly_timesheet[x].number
        } else if(cur_frm.doc.monthly_timesheet[x].type === 'Absent'){
           absent = cur_frm.doc.monthly_timesheet[x].number
        } else if(cur_frm.doc.monthly_timesheet[x].type === 'Working Holidays'){
           h_working = cur_frm.doc.monthly_timesheet[x].number
        } else if(cur_frm.doc.monthly_timesheet[x].type === 'Holiday'){
           holiday = cur_frm.doc.monthly_timesheet[x].number
        }
    }
    console.log(working_days)
    console.log(fridays)
    console.log(w_fridays)
    console.log(absent)
    console.log(h_working)
    console.log(holiday)
    update_monthly_timesheet(working_days,fridays, w_fridays, absent, h_working, holiday, cur_frm,d)
}
function update_monthly_timesheet(working_days,fridays, w_fridays, absent, h_working, holiday, cur_frm,d) {
    var friday_value = 0
    var normal_working_hour = 0
    var overtime_hour = 0
    for(var x=0;x<cur_frm.doc.monthly_timesheet.length;x+=1){
        if(cur_frm.doc.monthly_timesheet[x].type === 'Working Days'){
            normal_working_hour += cur_frm.doc.monthly_timesheet[x].working_hour

             friday_value = w_fridays > 0 && fridays > 0 && (d.type === "Fridays" || d.type === 'Working Fridays') ? fridays - w_fridays : fridays
           var workdays = holiday > 0 ? (working_days - friday_value - absent - holiday) + h_working : (working_days - friday_value - absent - holiday)
            cur_frm.doc.monthly_timesheet[x].number = workdays
            overtime_hour += cur_frm.doc.monthly_timesheet[x].working_hour >  (workdays * cur_frm.doc.normal_working_hour) ? cur_frm.doc.monthly_timesheet[x].working_hour - (workdays * cur_frm.doc.normal_working_hour) : 0

          cur_frm.refresh_field("monthly_timesheet")

        } else if(cur_frm.doc.monthly_timesheet[x].type === 'Fridays'){
           cur_frm.doc.monthly_timesheet[x].number = d.type === "Fridays" || d.type === 'Working Fridays' ? fridays - w_fridays: fridays
          cur_frm.refresh_field("monthly_timesheet")

        } else if(cur_frm.doc.monthly_timesheet[x].type === 'Working Fridays'){
            normal_working_hour += cur_frm.doc.monthly_timesheet[x].working_hour
            overtime_hour += cur_frm.doc.monthly_timesheet[x].working_hour
           cur_frm.doc.monthly_timesheet[x].number = w_fridays
          cur_frm.refresh_field("monthly_timesheet")

        } else if(cur_frm.doc.monthly_timesheet[x].type === 'Absent'){
           cur_frm.doc.monthly_timesheet[x].number = absent
          cur_frm.refresh_field("monthly_timesheet")

        } else if(cur_frm.doc.monthly_timesheet[x].type === 'Working Holidays'){
            overtime_hour += cur_frm.doc.monthly_timesheet[x].working_hour
            normal_working_hour += cur_frm.doc.monthly_timesheet[x].working_hour
           cur_frm.doc.monthly_timesheet[x].number = h_working
          cur_frm.refresh_field("monthly_timesheet")

        } else if(cur_frm.doc.monthly_timesheet[x].type === 'Holiday'){
           cur_frm.doc.monthly_timesheet[x].number = holiday
          cur_frm.refresh_field("monthly_timesheet")

        }
    }
    cur_frm.doc.overtime_hours = overtime_hour
    cur_frm.refresh_field("overtime_hours")
    compute_total_values(cur_frm, normal_working_hour, absent,overtime_hour)
}
function compute_total_values(cur_frm,normal_working_hour, absent,overtime_hour) {
    console.log(normal_working_hour)
    console.log(overtime_hour)
     frappe.db.get_doc("Staffing Cost", cur_frm.doc.staffing_type)
              .then(doc => {
                cur_frm.doc.total_costing_hour = (doc.default_cost_rate_per_hour * normal_working_hour) - (doc.absent_deduction_per_hour * absent)
               cur_frm.doc.total_absent_hour = type !== 'Absent' ?  doc.absent_deduction_per_hour * absent : 0
               cur_frm.doc.total_overtime_hour = doc.default_overtime_rate && doc.default_overtime_rate > 0 ? (doc.default_overtime_rate * overtime_hour) - (doc.absent_deduction_per_hour * absent) : 0
             cur_frm.refresh_fields(["total_costing_hour",'total_absent_hour'])
        })
}
frappe.ui.form.on('Timesy', {
    skip_timesheet: function () {
      if(cur_frm.doc.monthly_timesheet.length === 0 && cur_frm.doc.holiday_list){
          var from_date = new Date(cur_frm.doc.start_date)
          var end_date = new Date(cur_frm.doc.end_date)
          var number_of_days = (new Date(end_date - from_date)).getDate()

           cur_frm.call({
                doc: cur_frm.doc,
                method: 'get_holiday',
                args: {},
                freeze: true,
                freeze_message: "Changing Date...",
                 async: false,
                callback: (r) => {
                  var data = ['Working Days', 'Fridays','Holiday']
                    for(var x=0;x<data.length;x+=1){
                      cur_frm.add_child("monthly_timesheet", {
                          type: data[x],
                          number: data[x] === "Working Days" ? number_of_days - r.message[0] - r.message[1] : data[x] === 'Holidays' ? r.message[0] : data[x] === 'Fridays' ? r.message[1] : 0
                      })
                      cur_frm.refresh_field("monthly_timesheet")
                  }
                  compute_working_days(cur_frm,number_of_days, d)
              }
            })

      }

    },
    holiday_list: function () {
      if(cur_frm.doc.monthly_timesheet.length === 0 && cur_frm.doc.holiday_list){
          var from_date = new Date(cur_frm.doc.start_date)
          var end_date = new Date(cur_frm.doc.end_date)
          var number_of_days = (new Date(end_date - from_date)).getDate()

           cur_frm.call({
                doc: cur_frm.doc,
                method: 'get_holiday',
                args: {},
                freeze: true,
                freeze_message: "Changing Date...",
                 async: false,
                callback: (r) => {
                  var data = ['Working Days', 'Fridays','Holiday']
                    for(var x=0;x<data.length;x+=1){
                      cur_frm.add_child("monthly_timesheet", {
                          type: data[x],
                          number: data[x] === "Working Days" ? number_of_days - r.message[0] - r.message[1] : data[x] === 'Holiday' ? r.message[0] : data[x] === 'Fridays' ? r.message[1] : 0
                      })
                      cur_frm.refresh_field("monthly_timesheet")
                  }
                  compute_working_days(cur_frm,number_of_days, d)
              }
            })

      }

    },
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
                                cur_frm.save_or_update()
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
                 status: "Active",
                                 reference_type: 'Staff',

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
                reference_type: 'Employee',
              status: "Active"
          }
	        get_designation(cur_frm, obj)
        } else {
	        cur_frm.doc.designation = ""
	        cur_frm.doc.staffing_type = ""
	        cur_frm.doc.staffing_project = ""
            cur_frm.refresh_field("designation")
        }

	},
})
function get_designation(cur_frm, obj) {
     frappe.db.count('Staffing Cost', obj)
            .then(count => {
               if(count > 0){
                   console.log(obj)
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
    absent_hour: function(frm, cdt, cdn) {
                        total_costing(cur_frm)

	},
    timesy_details_remove: function(frm, cdt, cdn) {
                              total_costing(cur_frm)

	},
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
var absent_deduction = 0
function compute_hours(d,cur_frm) {
    frappe.db.get_doc("Staffing Cost", cur_frm.doc.staffing_type)
        .then(doc => {
            absent_deduction = doc.absent_deduction_per_hour
            if(d.status === "Absent"){
                d.working_hour = 0
                d.costing_hour = 0
                d.billing_hour = 0
                d.absent_hour = doc.absent_deduction_per_hour
                d.friday_hour = 0
                d.overtime_hour = cur_frm.doc.reference_type === 'Employee' && d.working_hour > 8? (d.working_hour - cur_frm.doc.normal_working_hour) * doc.default_overtime_rate: 0

                cur_frm.refresh_field(d.parentfield)
                total_costing(cur_frm)
            } else  if(d.status === "Medical"){
                d.working_hour = 0

                d.costing_hour = doc.default_cost_rate_per_hour * d.working_hour
                d.billing_hour = doc.default_billing_rate_per_hour * d.working_hour
                d.absent_hour = 0
                d.friday_hour =0
                d.overtime_hour = cur_frm.doc.reference_type === 'Employee' && d.working_hour > 8? (d.working_hour - cur_frm.doc.normal_working_hour) * doc.default_overtime_rate: 0


                cur_frm.refresh_field(d.parentfield)
                total_costing(cur_frm)
            }  else  if(d.status === "Friday"){
                d.costing_hour = 0
                d.billing_hour = 0
                d.absent_hour = 0
                d.friday_costing_hour = 0
                d.overtime_hour = 0
                cur_frm.refresh_field(d.parentfield)
                total_costing(cur_frm)
            } else  if(['Working', 'Holiday Working', 'Friday Working'].includes(d.status)){
                d.costing_hour = doc.default_cost_rate_per_hour * d.working_hour
                d.billing_hour = doc.default_billing_rate_per_hour * d.working_hour
                d.absent_hour = 0
                d.friday_hour = 0
                d.overtime_hour = cur_frm.doc.reference_type === 'Employee' && d.working_hour > 8? (d.working_hour - cur_frm.doc.normal_working_hour) * doc.default_overtime_rate: 0

                cur_frm.refresh_field(d.parentfield)
                total_costing(cur_frm)
            } else  if(d.status === "Holiday"){
                d.costing_hour = 0
                d.billing_hour = 0
                d.absent_hour = 0
                d.friday_costing_hour = 0
                d.overtime_hour = 0
                d.working_hour = 0
                cur_frm.refresh_field(d.parentfield)
                total_costing(cur_frm)
            }

    })
}
function total_costing(cur_frm) {
    var total_costing_hour = 0
    var total_billing_hour = 0
    var total_absent_hour = 0
    var total_overtime_hour = 0
    for(var x=0;x<cur_frm.doc.timesy_details.length;x+=1){

        total_costing_hour += cur_frm.doc.timesy_details[x].costing_hour
        total_billing_hour += cur_frm.doc.timesy_details[x].billing_hour
        total_overtime_hour += cur_frm.doc.timesy_details[x].overtime_hour
        total_absent_hour += cur_frm.doc.timesy_details[x].absent_hour
    }
    cur_frm.doc.total_costing_hour = total_costing_hour - total_absent_hour
    cur_frm.doc.total_billing_hour = total_billing_hour
    cur_frm.doc.total_absent_hour = total_absent_hour
    cur_frm.doc.total_overtime_hour = total_overtime_hour
    cur_frm.refresh_fields(['total_costing_hour','total_billing_hour','total_absent_hour', 'total_friday_hour', 'total_overtime_hour'])
}