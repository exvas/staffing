# Copyright (c) 2021, jan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class Timesy(Document):
	@frappe.whitelist()
	def change_status(self, status):
		frappe.db.sql(""" UPDATE `tabTimesy` SET status=%s WHERE name=%s""",(status, self.name))
		frappe.db.commit()
