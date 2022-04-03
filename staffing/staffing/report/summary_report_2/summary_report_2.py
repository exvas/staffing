# Copyright (c) 2013, jan and contributors
# For license information, please see license.txt

import frappe
from frappe.utils import money_in_words
from calendar import monthrange

def get_columns(filters):
    columns = [
        # {"label": "SL#","fieldname": "sl_number", "fieldtype": "Data", "width": "50"},
        {"label": "Iqama No", "fieldname": "employee", "fieldtype": "Data", "width": "100"},
        {"label": "Reference Details", "fieldname": "charge_type", "fieldtype": "Data", "width": "150"},
        {"label": "Name", "fieldname": "employee_name", "fieldtype": "Data", "width": "150"},
        {"label": "Category", "fieldname": "staffing_type", "fieldtype": "Data", "width": "150"},
        {"label": "Total Hrs", "fieldname": "total_hour", "fieldtype": "Float", "width": "90"},
        {"label": "Rate/HR", "fieldname": "default_cost_rate_per_hour", "fieldtype": "Float", "width": "90"},
        {"label": "Total Amount", "fieldname": "amount", "fieldtype": "Float", "width": "120"},
    ]
    return columns
def execute(filters=None):
    months = ['January', "February", "March","April", "May", "June", "July", "August", "September", "October", "November", "December"]
    columns, data = get_columns(filters), []
    months_no = " in ("
    month_no = ""

    condition = get_condition(filters)
    total_amount = total_absent = total_absent_deduction = charge_amount = 0
    total_deduction_timesheet = total_additionals_timesheet = 0
    customers = []
    for type in filters.get("staff_employee"):
        fields = get_fields(type)
        inner_join_filter = get_inner_join_filter(type)
        query = """ SELECT 
                         {0},T.skip_timesheet, T.total_costing_rate_deduction
                    FROM `tab{1}` E 
                    INNER JOIN `tabTimesy` T ON {2} = E.name
                    INNER JOIN `tabStaffing Cost` SC ON SC.name = T.staffing_cost
                    WHERE T.reference_type = '{3}'  and 
                    YEAR(T.start_date) = '{4}' {5}""".format(fields, type, inner_join_filter,type,filters.get("fiscal_year"),condition)
        print(query)
        timesy_data = frappe.db.sql(query, as_dict=1)
        for idx,x in enumerate(timesy_data):
            print(x.name)
            start_month = frappe.utils.getdate(x.start_date).month
            print(x.start_date)
            print(start_month)
            x['sl_number'] = idx + 1
            fields_details = "working_hour, status" if not x.skip_timesheet else "working_hour"
            query = """ SELECT {0} FROM `tab{1}` WHERE parent='{2}'""".format(fields_details,'Monthly Timesheet' if x.skip_timesheet else 'Timesy Details', x.name)
            timesy_details = frappe.db.sql(query, as_dict=1)
            print(timesy_details)
            sum = 0
            absent = 0
            for xx in timesy_details:
                if xx.working_hour == 0 and not x.skip_timesheet:
                    if xx.status == "Absent":
                        absent += 1
                else:
                    sum += xx.working_hour
            x['total_hour'] = sum
            x['absent'] = absent
            x['total_absent_deduction_per_hour'] = absent * x.absent_deduction_per_hour
            x['net_total'] = x['amount'] - x['total_absent_deduction_per_hour']
            total_amount += x['amount']
            total_absent += x['total_absent_deduction_per_hour']
            total_absent_deduction += x.total_absent_hour
            charge_amount += x.charge_amount
            if x.customer and x.customer not in customers:
                additionals_condition = " and TAD.customer='{0}' ".format(x.customer)
                timesheet_additionals_deduction = """ SELECT SUM(TAD.amount) as deductions FROM `tabTimesheet Additional` TA 
                                                    INNER JOIN `tabTimesheet Additional Details` TAD ON TAD.parent =TA.name 
                                                    WHERE TA.docstatus=1 and TAD.type = 'Deduction' and TA.fiscal_year= '{0}' and TA.month = '{1}' {2}""".format(
                    filters.get("fiscal_year"), months[start_month-1] ,additionals_condition)

                timesheet_additionals_additional = """ SELECT SUM(TAD.amount) as additional FROM `tabTimesheet Additional` TA 
                                                            INNER JOIN `tabTimesheet Additional Details` TAD ON TAD.parent =TA.name 
                                                            WHERE TA.docstatus=1 and  TAD.type = 'Additional' and TA.fiscal_year= '{0}' and TA.month = '{1}' {2}""".format(
                    filters.get("fiscal_year"), months[start_month-1], additionals_condition)

                get_deduction = frappe.db.sql(timesheet_additionals_deduction, as_dict=1)
                get_additional = frappe.db.sql(timesheet_additionals_additional, as_dict=1)
                total_deduction_timesheet += (get_deduction[0].deductions if len(get_deduction) > 0 and get_deduction[0].deductions else 0)
                total_additionals_timesheet += (get_additional[0].additional if len(get_additional) > 0 and get_additional[0].additional else 0)
                customers.append(x.customer)

        data += timesy_data

    if len(data) > 0:
        data[len(data) - 1]['total_amount'] = total_amount
        data[len(data) - 1]['total_absent'] = total_absent_deduction  + total_deduction_timesheet
        data[len(data) - 1]['charge_amount'] = charge_amount + total_additionals_timesheet
        without_vat = total_amount - (total_absent_deduction  + total_deduction_timesheet)

        data[len(data) - 1]['subtotal_without_vat_1'] = without_vat
        data[len(data) - 1]['fifteen_percent'] = round(without_vat * 0.15, 2)
        fifteen_percent = round(without_vat * 0.15, 2)
        data[len(data) - 1]['grand_total'] = round(without_vat + fifteen_percent + (charge_amount + total_additionals_timesheet),2)
        data[len(data) - 1]['total_deduction'] = round(total_absent_deduction, 2)
        data[len(data) - 1]['money_in_words'] = money_in_words(data[len(data) - 1]['grand_total'])
    return columns, data

def get_condition(filters):
    condition = ""

    if len(filters.get("employee")) == 1:
        condition += " and E.name = '{0}'".format(filters.get("employee")[0])
    elif len(filters.get("employee")) > 1:
        condition += " and E.name in {0}".format(tuple(filters.get("employee")))

    if len(filters.get("staff")) == 1:
        condition += " and E.name = '{0}'".format(filters.get("staff")[0])
    elif len(filters.get("staff")) > 1:
        condition += " and E.name in {0}".format(tuple(filters.get("staff")))

    if filters.get("type"):
        condition += " and T.reference_type = '{0}'".format(filters.get("type"))

    if filters.get("staffing_project"):
        condition += " and T.staffing_project = '{0}'".format(filters.get("staffing_project"))

    if filters.get('supplier'):
        condition += " and T.supplier = '{0}'".format(filters.get("supplier"))

    if filters.get('customer'):
        condition += " and T.customer = '{0}'".format(filters.get("customer"))

    if filters.get('status') == 'Draft':
        print("test")
        condition += " and T.docstatus = 0"
    else:
        print("kajshdlajsdlkja")
        condition += " and T.status='{0}' and T.docstatus = 1".format(filters.get("status"))

    return condition

def get_inner_join_filter(type):
    return "T.employee_code" if type == 'Employee' else "T.staff_code"

def get_fields(type):
    fields = ""
    if type == "Employee":
        fields = "T.employee_code as employee_code," \
                 "T.employee_name as employee_name,T.total_costing_hour as amount," \
                 "SC.staffing_type,T.name,T.charge_amount,E.iqama_number as employee," \
                 "T.total_absent_hour,SC.default_cost_rate_per_hour,T.charge_type," \
                 "SC.absent_deduction_per_hour, T.start_date, T.customer"
        print(fields)
    elif type == "Staff":
        fields = "T.staff_code as employee_code," \
                 "T.staff_name as employee_name,T.total_costing_hour as amount," \
                 "SC.staffing_type,T.name,T.charge_amount,E.iqama_number as employee," \
                 "T.total_absent_hour,SC.default_cost_rate_per_hour,T.charge_type," \
                 "SC.absent_deduction_per_hour, T.start_date, T.customer"
        print(fields)
    return fields