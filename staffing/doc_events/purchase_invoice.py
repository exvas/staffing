import frappe

@frappe.whitelist()
def get_staffing(doctype, target,setters,d,e,filter):
    print("============================")
    print(doctype)
    print(target)
    print(setters)
    print(d)
    print(e)
    print(filter)

    staffing = frappe.db.sql(""" SELECT * FROM `tabTimesy` WHERE docstatus=1 and reference_type='Staff' and status='Completed' """, as_dict=1)
    return staffing