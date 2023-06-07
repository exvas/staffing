# Copyright (c) 2023, jan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class WorkforceMobilization(Document):
	@frappe.whitelist()
	def get_document(self):
		if self.reference_type=="Employee":
			data = frappe.db.sql("""select name from `tabWorkforce Mobilization` where employee_code=%s and (status='Standby' or status='Released') and docstatus=1""",self.employee_code,as_dict=1)
		elif self.reference_type=="Staff":
			print("staff")
			data = frappe.db.sql("""select name from `tabWorkforce Mobilization` where staff_code=%s and (status='Standby' or status='Released') and docstatus=1""",self.staff_code,as_dict=1)
			print(data)		
		if data:
			return data
	@frappe.whitelist()
	def set_complete(self):
		frappe.db.set_value("Workforce Mobilization",self.workforce_mobilization,"status","Completed")
	@frappe.whitelist()
	def on_cancel(self):
		print("cancelled 88888888888888888888888888888888888888888888")
		if self.workforce_mobilization:
			frappe.db.sql("""update `tabWorkforce Mobilization` set status='Standby' where name=%s and demobilization_date IS NOT NULL""",self.workforce_mobilization)
			frappe.db.sql("""update `tabWorkforce Mobilization` set status='Released' where name=%s and release_date IS NOT NULL""",self.workforce_mobilization)
			# frappe.db.set_value("Workforce Mobilization",self.workforce_mobilization,"status","")
