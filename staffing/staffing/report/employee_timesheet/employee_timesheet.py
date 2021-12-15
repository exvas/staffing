# Copyright (c) 2013, jan and contributors
# For license information, please see license.txt

import frappe
from calendar import monthrange

def get_columns(filters):
	columns = [
		{"label": "SL#","fieldname": "sl_number", "fieldtype": "Data", "width": "50"},
		{"label": "Name", "fieldname": "employee_name", "fieldtype": "Data", "width": "150"},
		{"label": "Craft", "fieldname": "designation", "fieldtype": "Data", "width": "150"},
		{"label": "Total Hrs", "fieldname": "total_hour", "fieldtype": "Float", "width": "150"},
		{"label": "Rate/HR", "fieldname": "default_billing_rate_per_hour", "fieldtype": "Float", "width": "150"},
		{"label": "Total Amount", "fieldname": "total_amount", "fieldtype": "Float", "width": "150"},
	]
	return columns
def execute(filters=None):
	months = ['January', "February", "March","April", "May", "June", "July", "August", "September", "October", "November", "December"]
	columns, data = get_columns(filters), []
	month_no = months.index(filters.get("month")) + 1
	condition = get_condition(filters)

	query = """ SELECT 
					 T.employee_code as employee,
					 T.employee_name as employee_name,
					 E.designation,
					 T.name,
					 SC.default_billing_rate_per_hour,
					 SC.absent_deduction_per_hour
				FROM `tabEmployee` E 
				INNER JOIN `tabTimesy` T ON T.employee_code = E.name
				INNER JOIN `tabStaffing Cost` SC ON SC.name = T.staffing_type
				WHERE T.status = 'Completed' and 
				MONTH(T.start_date) = '{0}' and 
				YEAR(T.start_date) = '{1}' {2}""".format(month_no,filters.get("fiscal_year"),condition)
	data += frappe.db.sql(query, as_dict=1)
	total_amount = total_absent = total_absent_deduction = 0
	for idx,x in enumerate(data):
		x['sl_number'] = idx + 1
		timesy_details = frappe.db.sql(""" SELECT DAY(date) as day_of_the_month, working_hour, status FROM `tabTimesy Details` WHERE parent=%s""", x.name, as_dict=1)
		print(timesy_details)
		sum = 0
		absent = 0
		for xx in timesy_details:
			if xx.working_hour == 0:
				if xx.status == "Absent":
					absent += 1
				x[str(xx.day_of_the_month)] = xx.status[0]
			else:
				sum += xx.working_hour
				x[str(xx.day_of_the_month)] = xx.working_hour

		x['total_hour'] = sum
		x['amount'] = x.default_billing_rate_per_hour * sum
		x['absent'] = absent
		x['total_absent_deduction_per_hour'] = absent * x.absent_deduction_per_hour
		x['net_total'] = x['amount'] - x['total_absent_deduction_per_hour']
		total_amount += x['amount']
		total_absent += x['total_absent_deduction_per_hour']
		total_absent_deduction += absent * x.absent_deduction_per_hour

	if len(data) > 0:
		data[len(data)-1]['total_amount'] = total_amount
		data[len(data)-1]['total_absent'] = total_absent
		data[len(data)-1]['subtotal_without_vat_1'] = total_amount - total_absent
		data[len(data)-1]['fifteen_percent'] =round((total_amount - total_absent) * 0.15,2)
		data[len(data)-1]['grand_total'] =round(((total_amount - total_absent_deduction) * 0.15),2) + (total_amount - total_absent_deduction)
		data[len(data)-1]['total_deduction'] =round(total_absent_deduction,2)

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

	return condition

def get_inner_join_filter(type):
	return "T.employee_code" if type == 'Employee' else "T.staff_code"
