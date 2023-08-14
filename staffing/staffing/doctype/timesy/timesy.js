// Copyright (c) 2021, jan and contributors
// For license information, please see license.txt
var has_si = false
var has_pi = false
var additional_salary = false
var deleted_object = {}
var type = ""
frappe.ui.form.on('Monthly Timesheet', {
    type: function (frm, cdt, cdn) {
        var d = locals[cdt][cdn]
        var from_date = new Date(cur_frm.doc.start_date)
        var end_date = new Date(cur_frm.doc.end_date)
        var number_of_days = (new Date(end_date - from_date)).getDate()

        if(d.type === 'Working Days'){
            type = ""
            deleted_object = {}
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
           compute_working_days(cur_frm,number_of_days, deleted_object)
        }
    },
    before_monthly_timesheet_remove: function (frm, cdt, cdn) {
        var d = locals[cdt][cdn]
       type = d.type
       deleted_object = d

    },
    working_hour: function (frm, cdt, cdn) {
        var d = locals[cdt][cdn]
        var from_date = new Date(cur_frm.doc.start_date)
        var end_date = new Date(cur_frm.doc.end_date)
        var number_of_days = (new Date(end_date - from_date)).getDate()
        if(d.type === 'Working Days'){
            compute_working_days(cur_frm,number_of_days, d)

        } else {
            d.working_hour = 0
            cur_frm.refresh_field("monthly_timesheet")
        }
    },
})
function compute_working_days(cur_frm,number_of_days, d) {
    var working_days = number_of_days
    var fridays = 0
    var w_fridays = 0
    var absent = 0
    var h_working = 0
    var holiday = 0
    var release = 0
    var bad_weather = 0
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
        else if(cur_frm.doc.monthly_timesheet[x].type === 'Release'){
            release = cur_frm.doc.monthly_timesheet[x].number
        }
        else if(cur_frm.doc.monthly_timesheet[x].type === 'Bad Weather'){
            bad_weather = cur_frm.doc.monthly_timesheet[x].number
        }
    }
    update_monthly_timesheet(working_days,fridays, w_fridays, absent, h_working, holiday,release,bad_weather, cur_frm,d)
}
function update_monthly_timesheet(working_days,fridays, w_fridays, absent, h_working, holiday,release,bad_weather, cur_frm,d) {
    var friday_value = 0
    var normal_working_hour = 0
    var overtime_hour = 0
    for(var x=0;x<cur_frm.doc.monthly_timesheet.length;x+=1){
        if(cur_frm.doc.monthly_timesheet[x].type === 'Working Days'){
            normal_working_hour += cur_frm.doc.monthly_timesheet[x].working_hour
            console.log("naa diri")
            console.log(d)
             friday_value = w_fridays > 0 && fridays > 0 && (d.type && (d.type === "Fridays" || d.type === 'Working Fridays')) ? fridays - w_fridays : fridays
           var workdays = holiday > 0 ? (working_days - friday_value - absent - holiday - release - bad_weather) + h_working : (working_days - friday_value - absent - holiday - release - bad_weather)
            cur_frm.doc.monthly_timesheet[x].number = workdays
            overtime_hour += cur_frm.doc.monthly_timesheet[x].working_hour >  (workdays * cur_frm.doc.normal_working_hour) ? cur_frm.doc.monthly_timesheet[x].working_hour - (workdays * cur_frm.doc.normal_working_hour) : 0

          cur_frm.refresh_field("monthly_timesheet")

        } else if(cur_frm.doc.monthly_timesheet[x].type === 'Fridays'){
           cur_frm.doc.monthly_timesheet[x].number = (d.type && (d.type === "Fridays" || d.type === 'Working Fridays')) ? fridays - w_fridays: fridays
          cur_frm.refresh_field("monthly_timesheet")

        } else if(cur_frm.doc.monthly_timesheet[x].type === 'Working Fridays'){
            normal_working_hour += cur_frm.doc.monthly_timesheet[x].working_hour
            overtime_hour += cur_frm.doc.monthly_timesheet[x].working_hour
           cur_frm.doc.monthly_timesheet[x].number = w_fridays
          cur_frm.refresh_field("monthly_timesheet")

        } else if(cur_frm.doc.monthly_timesheet[x].type === 'Absent'){
           cur_frm.doc.monthly_timesheet[x].number = absent
          cur_frm.refresh_field("monthly_timesheet")

        } else if(cur_frm.doc.monthly_timesheet[x].type === 'Release'){
            cur_frm.doc.monthly_timesheet[x].number = release
           cur_frm.refresh_field("monthly_timesheet")
 
         } else if(cur_frm.doc.monthly_timesheet[x].type === 'Bad Weather'){
            cur_frm.doc.monthly_timesheet[x].number = bad_weather
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
    cur_frm.doc.total_overtime_hour_staff = overtime_hour
    cur_frm.doc.total_working_hour = normal_working_hour
    cur_frm.refresh_fields(["overtime_hours","total_working_hour","total_overtime_hour_staff"])
    compute_total_values(cur_frm, normal_working_hour, absent,overtime_hour)
}
function compute_total_values(cur_frm,normal_working_hour, absent,overtime_hour) {
    console.log(normal_working_hour)
    console.log(overtime_hour)
     frappe.db.get_doc("Staffing Cost", cur_frm.doc.staffing_cost)
              .then(doc => {
            var absent_hours_rate= type !== 'Absent' ?  doc.absent_deduction_per_hour * absent : 0
            cur_frm.doc.total_costing_hour = (doc.default_cost_rate_per_hour * normal_working_hour) - cur_frm.doc.total_absent_hour - cur_frm.doc.total_costing_rate_deduction
            cur_frm.doc.total_billing_hour = (doc.default_billing_rate_per_hour * normal_working_hour) - cur_frm.doc.total_absent_hour - cur_frm.doc.total_billing_rate_deduction
            cur_frm.doc.total_overtime_hour = (overtime_hour * doc.default_overtime_rate) - cur_frm.doc.total_absent_hour
            cur_frm.refresh_fields(["total_costing_hour",'total_absent_hour', 'total_overtime_hour', 'total_billing_hour'])
        })
}
frappe.ui.form.on('Timesy', {
    manually_deduct:function(frm){
        console.log("manually enter")
        total_costing(cur_frm)
    },
    manually_deduct_billing:function(frm){
        total_costing(cur_frm)

    },
    additions:function(frm){
        total_costing(cur_frm)

    },
    normal_working_hour: function (frm, cdt, cdn) {
        var d = locals[cdt][cdn]
        var from_date = new Date(cur_frm.doc.start_date)
        var end_date = new Date(cur_frm.doc.end_date)
        var number_of_days = (new Date(end_date - from_date)).getDate()
        if(cur_frm.doc.monthly_timesheet){
            for(var x=0;x<cur_frm.doc.monthly_timesheet.length;x+=1){
                compute_working_days(cur_frm,number_of_days, cur_frm.doc.monthly_timesheet[x])
            }
        }
        total_costing(cur_frm)
    },
    include_in_total_costing_rate:function(frm){
        total_costing(cur_frm)

    },
    skip_timesheet: function (frm, cdt, cdn) {
        var d = locals[cdt][cdn]
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
    holiday_list: function (frm, cdt, cdn) {
                var d = locals[cdt][cdn]
cur_frm.clear_table("monthly_timesheet")
          cur_frm.refresh_field("monthly_timesheet")
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
        if(cur_frm.doc.timesy_details.length > 0 && !cur_frm.doc.skip_timesheet){
            if(!cur_frm.doc.timesy_details[0].date){
                cur_frm.doc.timesy_details[0].date = cur_frm.doc.start_date
                cur_frm.refresh_field("timesy_details")
            }
        }
        if(cur_frm.doc.skip_timesheet){
            cur_frm.trigger("holiday_list")
        }
        if(cur_frm.doc.start_date && cur_frm.doc.end_date){
            cur_frm.call({
                doc: cur_frm.doc,
                method: 'check_date',
                args: {
                    start_date: cur_frm.doc.start_date,
                    end_date: cur_frm.doc.end_date,

                },
                freeze: true,
                freeze_message: "Changing Date...",
                 async: false,
                callback: (r) => {
              }
            })
        }
    },
    end_date: function () {
        if(cur_frm.doc.timesy_details.length > 0 && !cur_frm.doc.skip_timesheet){
            if(!cur_frm.doc.timesy_details[0].date){
                cur_frm.doc.timesy_details[0].date = cur_frm.doc.start_date
                cur_frm.refresh_field("timesy_details")
            }
        }
        if(cur_frm.doc.skip_timesheet){
             cur_frm.trigger("holiday_list")
        }
 if(cur_frm.doc.start_date && cur_frm.doc.end_date){
            console.log("ALSDLKAJSDk")
            cur_frm.call({
                doc: cur_frm.doc,
                method: 'check_date',
                args: {
                    start_date: cur_frm.doc.start_date,
                    end_date: cur_frm.doc.end_date,

                },
                freeze: true,
                freeze_message: "Changing Date...",
                 async: false,
                callback: (r) => {
              }
            })
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
         cur_frm.get_field("monthly_timesheet").grid.cannot_add_rows = true;
            cur_frm.refresh_field("monthly_timesheet")
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
        if(cur_frm.doc.docstatus && cur_frm.doc.status === "In Progress" && !cur_frm.doc.skip_timesheet){
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
                    frappe.call({
                        method: "staffing.staffing.doctype.timesy.timesy.generate_as",
                        args:{
                            source_name: cur_frm.doc.name,
                        },
                        async: false,
                        callback: function () {
                            cur_frm.reload_doc()
                        }
                    })

                    });
            }

        }
         cur_frm.set_query("employee_code", () => {
            return {
                filters: {
                    status: 'Active',
                    company:cur_frm.doc.company
                }
            }
        })
        cur_frm.set_query("staff_code", () => {
            return {
                filters: {
                    status: 'Active',
                    company:cur_frm.doc.company
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
	        cur_frm.doc.staffing_cost = ""
	        cur_frm.doc.staffing_project = ""
            cur_frm.refresh_fields(["designation","staffing_type","staffing_cost","staffing_project"])
        }

	},
    total_absent_hour: function(frm) {
        console.log("yes")
        frappe.db.get_doc("Staffing Cost", cur_frm.doc.staffing_cost)
              .then(doc => {

            cur_frm.doc.total_overtime_hour = (cur_frm.doc.overtime_hours * doc.default_overtime_rate) - cur_frm.doc.total_absent_hour

             cur_frm.refresh_fields(['total_overtime_hour'])
        })
        total_costing(cur_frm)

	},
    manually_deduct_absent:function(frm){
        total_costing(cur_frm)
    },
    total_costing_rate_deduction: function(frm) {
        if(cur_frm.doc.skip_timesheet){
            var from_date = new Date(cur_frm.doc.start_date)
            var end_date = new Date(cur_frm.doc.end_date)
            var number_of_days = (new Date(end_date - from_date)).getDate()

           compute_working_days(cur_frm,number_of_days, {})
        } else {
            total_costing(cur_frm)
        }


	},
    total_billing_rate_deduction: function(frm) {
       if(cur_frm.doc.skip_timesheet){
            var from_date = new Date(cur_frm.doc.start_date)
            var end_date = new Date(cur_frm.doc.end_date)
            var number_of_days = (new Date(end_date - from_date)).getDate()
           compute_working_days(cur_frm,number_of_days, {})
        } else {
            total_costing(cur_frm)
        }

	},
    reference_type:function(frm){
        if(!cur_frm.doc.company){
            frm.doc.reference_type=''
            cur_frm.refresh_field("reference_type")
            frappe.throw("Please select Company first")
        }
    },
})
function get_designation(cur_frm, obj) {
     frappe.db.count('Staffing Cost', obj)
            .then(count => {
               if(count > 0){
                   console.log(obj)
                    frappe.db.get_value('Staffing Cost', obj,  ["name", "staffing_project", "supplier", "customer","supplier_name","customer_name", "staffing_type"])
                        .then(r => {
                            let values = r.message;
                            console.log(values)
                            cur_frm.doc.staffing_cost = values.name
                            cur_frm.doc.staffing_type = values.staffing_type
                            cur_frm.doc.staffing_project = values.staffing_project
                            if(cur_frm.doc.reference_type === 'Staff'){

                            cur_frm.doc.supplier = values.supplier
                            cur_frm.doc.supplier_name = values.supplier_name
                            }
                            cur_frm.doc.customer_name = values.customer_name
                            cur_frm.doc.customer = values.customer
                            cur_frm.refresh_fields(["staffing_type","staffing_project","supplier","customer","supplier_name","customer_name", "staffing_cost"])
                            if(cur_frm.doc.timesy_details){
                                compute_working_days(cur_frm,number_of_days, cur_frm.doc.timesy_details[0])
                            }

                        })

                }
            })
}
frappe.ui.form.on('Timesy Details', {
    absent_hour: function(frm, cdt, cdn) {
                        total_costing(cur_frm)
                        total_calculation(cur_frm);

	},
    timesy_details_remove: function(frm, cdt, cdn) {
        total_costing(cur_frm)
        total_calculation(cur_frm);
	},
    after_timesy_details_remove:function(frm, cdt, cdn){
        total_costing(cur_frm)
        total_calculation(cur_frm);
    },
    working_hour: function(frm, cdt, cdn) {

        var d = locals[cdt][cdn]
        if(d.status === 'Friday'){
            d.working_hour = 0
            cur_frm.refresh_field(d.parentfield)
                frappe.throw("Cannot add working hour if status is Friday")
        } else {
            if(cur_frm.doc.staffing_cost){
           compute_hours(d,cur_frm)
        }
        }



        if(cur_frm.doc.reference_type=="Employee"){
            if(d.working_hour>cur_frm.doc.normal_working_hour){
                d.ot_hour= d.working_hour - cur_frm.doc.normal_working_hour

            }
            if(d.working_hour==cur_frm.doc.normal_working_hour){
                d.ot_hour=0 
            }
            if(d.status === "Friday Working Full Overtime" || d.status === "Holiday Working Full Overtime"){
                d.ot_hour= d.working_hour 
            }
            else{
                if(d.working_hour>cur_frm.doc.normal_working_hour){
                d.ot_hour= d.working_hour - cur_frm.doc.normal_working_hour

            }
            }
            
        }
        else{
            d.ot_hour=0
        }
        
        total_calculation(cur_frm);
        
        


	},
    status: function(frm, cdt, cdn) {
        var d = locals[cdt][cdn]
        if(cur_frm.doc.staffing_cost){
           compute_hours(d,cur_frm)
        }
        if(cur_frm.doc.reference_type=="Employee"){
            if(d.working_hour>cur_frm.doc.normal_working_hour){
                d.ot_hour= d.working_hour - cur_frm.doc.normal_working_hour

            }
            if(d.working_hour==cur_frm.doc.normal_working_hour){
                d.ot_hour=0 
            }
            if(d.status === "Friday Working Full Overtime" || d.status === "Holiday Working Full Overtime"){
                d.ot_hour= d.working_hour 
            }
            else{
                if(d.working_hour>cur_frm.doc.normal_working_hour){
                d.ot_hour= d.working_hour - cur_frm.doc.normal_working_hour

            }
            }
            
        }
        else{
            d.ot_hour=0
        }
        total_calculation(cur_frm);
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

function total_calculation(cur_frm){
    console.log("my function")
    var table = cur_frm.doc.timesy_details
    var total_ot =0
    var total_hr =0
    var total_ded =0
    for(var i=0;i<table.length;i++){
        if(table[i].ot_hour){
            total_ot += table[i].ot_hour
        }
        total_hr += table[i].working_hour
        if (table[i].absent_hour){
            total_ded += table[i].absent_hour
        }
    }
    cur_frm.set_value("total_overtime_hours",total_ot)
    cur_frm.set_value("total_working_hours",total_hr)
   
   
    
    
}
var absent_deduction = 0
function compute_hours(d,cur_frm) {
    frappe.db.get_doc("Staffing Cost", cur_frm.doc.staffing_cost)
        .then(doc => {
            absent_deduction = doc.absent_deduction_per_hour
            if(d.status === "Absent"){
                console.log("absent")
                d.working_hour = 0
                d.costing_hour = 0
                d.billing_hour = 0
                d.absent_hour = doc.absent_deduction_per_hour
                d.friday_hour = 0
                d.overtime_hour = cur_frm.doc.reference_type === 'Employee' && d.working_hour > cur_frm.doc.normal_working_hour? (d.working_hour - cur_frm.doc.normal_working_hour) * doc.default_overtime_rate: 0
                cur_frm.refresh_field(d.parentfield)
                total_costing(cur_frm)
            } else  if(d.status === "Medical"){
                d.working_hour = 0
                d.costing_hour = doc.default_cost_rate_per_hour * d.working_hour
                d.billing_hour = doc.default_billing_rate_per_hour * d.working_hour
                d.absent_hour = 0
                d.friday_hour =0
                d.overtime_hour = cur_frm.doc.reference_type === 'Employee' && d.working_hour > cur_frm.doc.normal_working_hour? (d.working_hour - cur_frm.doc.normal_working_hour) * doc.default_overtime_rate: 0
                cur_frm.refresh_field(d.parentfield)
                total_costing(cur_frm)
            }  else  if(['Friday', 'Standby'].includes(d.status)){
                d.costing_hour = 0
                d.billing_hour = 0
                d.absent_hour = 0
                d.friday_costing_hour = 0
                d.overtime_hour = 0
                d.working_hour = 0
                cur_frm.refresh_field(d.parentfield)
                total_costing(cur_frm)
            } else  if(['Working', 'Holiday Working', 'Friday Working', 'Standby Pay'].includes(d.status)){
                d.costing_hour = doc.default_cost_rate_per_hour * d.working_hour
                d.billing_hour = doc.default_billing_rate_per_hour * d.working_hour
                d.absent_hour = 0
                d.friday_hour = 0
                d.overtime_hour = cur_frm.doc.reference_type === 'Employee' && d.working_hour > cur_frm.doc.normal_working_hour? (d.working_hour - cur_frm.doc.normal_working_hour) * doc.default_overtime_rate: 0
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
            }else if(d.status === "Release"){
                d.working_hour = 0
                d.costing_hour = 0
                d.billing_hour = 0
                d.absent_hour = doc.absent_deduction_per_hour
                d.friday_hour = 0
                d.overtime_hour = cur_frm.doc.reference_type === 'Employee' && d.working_hour > cur_frm.doc.normal_working_hour? (d.working_hour - cur_frm.doc.normal_working_hour) * doc.default_overtime_rate: 0
                cur_frm.refresh_field(d.parentfield)
                total_costing(cur_frm)
            }else if(d.status === "Bad Weather"){
                d.costing_hour = 0
                d.billing_hour = 0
                d.absent_hour = 0
                d.friday_costing_hour = 0
                d.overtime_hour = 0
                d.working_hour = 0
                cur_frm.refresh_field(d.parentfield)
                total_costing(cur_frm)
                // d.working_hour = 0
                // d.costing_hour = 0
                // d.billing_hour = 0
                // d.absent_hour = doc.absent_deduction_per_hour
                // d.friday_hour = 0
                // d.overtime_hour = cur_frm.doc.reference_type === 'Employee' && d.working_hour > cur_frm.doc.normal_working_hour? (d.working_hour - cur_frm.doc.normal_working_hour) * doc.default_overtime_rate: 0
                // cur_frm.refresh_field(d.parentfield)
                // total_costing(cur_frm)
            }
            else if(d.status === "Holiday Working Full Overtime"){
                d.costing_hour = doc.default_cost_rate_per_hour * d.working_hour
                d.billing_hour = doc.default_billing_rate_per_hour * d.working_hour
                d.absent_hour = 0
                d.friday_hour = 0
                d.overtime_hour = cur_frm.doc.reference_type === 'Employee' && d.working_hour ? (d.working_hour) * doc.default_overtime_rate: 0
                cur_frm.refresh_field(d.parentfield)
                total_costing(cur_frm)
                
            }
            else if(d.status === "Friday Working Full Overtime"){
                d.costing_hour = doc.default_cost_rate_per_hour * d.working_hour
                d.billing_hour = doc.default_billing_rate_per_hour * d.working_hour
                d.absent_hour = 0
                d.friday_hour = 0
                d.overtime_hour = cur_frm.doc.reference_type === 'Employee' && d.working_hour ? (d.working_hour) * doc.default_overtime_rate: 0
                cur_frm.refresh_field(d.parentfield)
                total_costing(cur_frm)
                
            }
            

    })
}
function total_costing(cur_frm) {
    console.log('working')
    var total_costing_hour = 0
    var total_billing_hour = 0
    var total_absent_hour = 0
    var total_overtime_hour = 0
    var total_working_hour = 0
    
    var from_date = new Date(cur_frm.doc.start_date)
    var end_date = new Date(cur_frm.doc.end_date)
    var number_of_days = (new Date(end_date - from_date)).getDate()
    for(var x=0;x<cur_frm.doc.timesy_details.length;x+=1){
        total_working_hour += cur_frm.doc.timesy_details[x].working_hour
        total_costing_hour += cur_frm.doc.timesy_details[x].costing_hour
        total_billing_hour += cur_frm.doc.timesy_details[x].billing_hour
        total_overtime_hour += cur_frm.doc.timesy_details[x].overtime_hour
        total_absent_hour += cur_frm.doc.timesy_details[x].absent_hour
    }
    if(cur_frm.doc.manually_deduct_absent==1){
        total_absent_hour=0
        total_absent_hour = cur_frm.doc.total_absent_hour
    }
    console.log("nearrrr")
    if(cur_frm.doc.manually_deduct==0){
        cur_frm.doc.total_costing_rate_deduction = total_absent_hour
        cur_frm.refresh_field("total_costing_rate_deduction")
    }
    if(cur_frm.doc.manually_deduct_billing==0){
        cur_frm.doc.total_billing_rate_deduction = total_absent_hour
        cur_frm.refresh_field("total_billing_rate_deduction")
    }
    console.log("my func")
    console.log(total_costing_hour)
    cur_frm.doc.total_costing_rate_before_deduction = total_costing_hour
    cur_frm.doc.total_billing_rate_before_deduction = total_billing_hour
    if(cur_frm.doc.manually_deduct==0){
    cur_frm.doc.total_costing_hour = total_costing_hour - total_absent_hour 
    }
    else{
        cur_frm.doc.total_costing_hour = total_costing_hour - cur_frm.doc.total_costing_rate_deduction
    }
    if(cur_frm.doc.manually_deduct_billing==0){
        cur_frm.doc.total_billing_hour = total_billing_hour - total_absent_hour
    }
    else{
        cur_frm.doc.total_billing_hour = total_billing_hour - cur_frm.doc.total_billing_rate_deduction
    }
    if(cur_frm.doc.additions){
        cur_frm.doc.total_billing_hour = total_billing_hour + cur_frm.doc.additions
        
    }
    else{
        cur_frm.doc.total_billing_hour = total_billing_hour - total_absent_hour
    }

    if(cur_frm.doc.manually_deduct_absent==0){
        cur_frm.doc.total_absent_hour = total_absent_hour
        cur_frm.refresh_field("total_absent_hour")
    }
    if(cur_frm.doc.include_in_total_costing_rate){
        cur_frm.doc.total_costing_hour = cur_frm.doc.total_costing_hour + cur_frm.doc.charge_amount
    }
    // else{
    //     cur_frm.doc.total_billing_rate_deduction = total_absent_hour
    //     cur_frm.refresh_field("total_billing_rate_deduction")
    // }
    // cur_frm.doc.total_absent_hour = total_absent_hour
    cur_frm.doc.total_working_hour = total_working_hour
    cur_frm.doc.total_overtime_hour = total_overtime_hour
    cur_frm.doc.total_overtime_hour_staff = total_working_hour >= (cur_frm.doc.normal_working_hour * number_of_days) ? total_working_hour - (cur_frm.doc.normal_working_hour * number_of_days) : 0

    cur_frm.refresh_fields(['total_billing_rate_before_deduction','total_costing_rate_before_deduction','total_costing_rate_deduction','total_overtime_hour_staff','total_costing_hour','total_billing_hour','total_absent_hour', 'total_friday_hour', 'total_overtime_hour','total_working_hour'])
}