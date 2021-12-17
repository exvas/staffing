# Copyright (c) 2013, jan and contributors
# For license information, please see license.txt

import frappe
from frappe.utils import money_in_words
from calendar import monthrange

def get_columns(filters):
	columns = [
		{"label": "SL#","fieldname": "sl_number", "fieldtype": "Data", "width": "50"},
		{"label": "Name", "fieldname": "employee_name", "fieldtype": "Data", "width": "150"},
		{"label": "Category", "fieldname": "staffing_type", "fieldtype": "Data", "width": "150"},
		{"label": "Total Hrs", "fieldname": "total_hour", "fieldtype": "Float", "width": "150"},
		{"label": "Rate/HR", "fieldname": "total_absent_hour", "fieldtype": "Float", "width": "150"},
		{"label": "Deduction", "fieldname": "total_costing_rate_deduction", "fieldtype": "Float", "width": "150"},
		{"label": "Total Amount", "fieldname": "amount", "fieldtype": "Float", "width": "150"},
	]
	return columns
def execute(filters=None):
	months = ['January', "February", "March","April", "May", "June", "July", "August", "September", "October", "November", "December"]
	columns, data = get_columns(filters), []
	month_no = months.index(filters.get("month")) + 1
	condition = get_condition(filters)
	for type in filters.get("staff_employee"):
		fields = get_fields(type)
		inner_join_filter = get_inner_join_filter(type)
		query = """ SELECT 
						 {0},T.skip_timesheet, T.total_costing_rate_deduction
					FROM `tab{1}` E 
					INNER JOIN `tabTimesy` T ON {2} = E.name
					INNER JOIN `tabStaffing Cost` SC ON SC.name = T.staffing_type
					WHERE T.reference_type = '{3}' and T.status = 'Completed' and 
					MONTH(T.start_date) = '{4}' and 
					YEAR(T.start_date) = '{5}' {6}""".format(fields, type, inner_join_filter,type,month_no,filters.get("fiscal_year"),condition)
		timesy_data = frappe.db.sql(query, as_dict=1)
		total_amount = total_absent = total_absent_deduction = charge_amount = 0
		for idx,x in enumerate(timesy_data):
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

		if len(timesy_data) > 0:
			timesy_data[len(timesy_data)-1]['total_amount'] = total_amount
			timesy_data[len(timesy_data)-1]['total_absent'] = total_absent_deduction
			timesy_data[len(timesy_data)-1]['charge_amount'] = charge_amount
			timesy_data[len(timesy_data)-1]['subtotal_without_vat_1'] = total_amount - total_absent_deduction
			timesy_data[len(timesy_data)-1]['fifteen_percent'] =round((total_amount - total_absent_deduction) * 0.15,2)
			timesy_data[len(timesy_data)-1]['grand_total'] =round(((total_amount - total_absent_deduction) * 0.15),2) + (total_amount - total_absent_deduction) + charge_amount
			timesy_data[len(timesy_data)-1]['total_deduction'] =round(total_absent_deduction,2)
			timesy_data[len(timesy_data)-1]['money_in_words'] =money_in_words(timesy_data[len(timesy_data)-1]['grand_total'])

		data += timesy_data
	return columns, data

def get_condition(filters):
	condition = ""

	if filters.get("employee"):
		condition += " and E.name = '{0}'".format(filters.get("employee"))

	if filters.get("staff"):
		condition += " and E.name = '{0}'".format(filters.get("staff"))

	if filters.get("type"):
		condition += " and T.reference_type = '{0}'".format(filters.get("type"))

	if filters.get("staffing_project"):
		condition += " and T.staffing_project = '{0}'".format(filters.get("staffing_project"))

	if filters.get('supplier'):
		condition += " and T.supplier = '{0}'".format(filters.get("supplier"))

	if filters.get('customer'):
		condition += " and T.customer = '{0}'".format(filters.get("customer"))

	return condition

def get_inner_join_filter(type):
	return "T.employee_code" if type == 'Employee' else "T.staff_code"

def get_fields(type):
	fields = ""
	if type == "Employee":
		fields = "T.employee_code as employee," \
				 "T.employee_name as employee_name,T.total_costing_hour as amount," \
				 "SC.staffing_type,T.name,T.charge_amount," \
				 "SC.total_absent_hour," \
				 "SC.absent_deduction_per_hour"
		print(fields)
	elif type == "Staff":
		fields = "T.staff_code as employee," \
				 "T.staff_name as employee_name,T.total_costing_hour as amount," \
				 "SC.staffing_type,T.name,T.charge_amount," \
				 "SC.total_absent_hour," \
				 "SC.absent_deduction_per_hour"
		print(fields)
	return fields