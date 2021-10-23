# Copyright (c) 2021, jan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class Timesy(Document):
    @frappe.whitelist()
    def change_status(self, status):
        frappe.db.sql(""" UPDATE `tabTimesy` SET status=%s WHERE name=%s""",(status, self.name))
        frappe.db.commit()

    @frappe.whitelist()
    def change_date(self):
        condition = ""
        if self.reference_type == "Employee":
            condition += " and employee_code='{0}' ".format(self.employee_code)
        if self.reference_type == "Staff":
            condition += " and staff_code='{0}' ".format(self.staff_code)
        query = """ UPDATE `tabStaffing Cost` SET demobilization_date=%s, status='Expired' WHERE docstatus = 1 {0}""".format(condition)
        frappe.db.sql(query)
        frappe.db.commit()
