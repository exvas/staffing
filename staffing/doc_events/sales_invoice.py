import frappe, json
@frappe.whitelist()
def get_timesies(doctype):
    query = """ SELECT T.name FROM `tabTimesy` T 
                          INNER JOIN `tabTimesy List` TL ON TL.timesy = T.name 
                          INNER JOIN `tab{0}` DD ON DD.name = TL.parent
                          WHERE T.docstatus = 1 and DD.docstatus = 1 and T.status = 'Completed'""".format(doctype)
    t = frappe.db.sql(query, as_dict=1)

    return [i.name for i in t]
def get_condition(filters):
    if filters['staffing_type'][1]:
        if filters['staffing_type'][0] == "in" or filters['staffing_type'][0] == "not in":
            in_not_in = ()
            if len(filters['staffing_type'][1]) == 1:
                return " and staffing_type = '{0}' ".format(filters['staffing_type'][1][0])

            for i in filters['staffing_type'][1]:
                in_not_in += (i,)
            return " and staffing_type {0} {1} ".format(filters['staffing_type'][0],in_not_in)
        return " and staffing_type {0} '{1}' ".format(filters['staffing_type'][0],filters['staffing_type'][1])
    return ""
@frappe.whitelist()
def get_staffing(doctype, target,setters,d,e,filters):
    print("============================")
    print(doctype)
    print(target)
    print(setters)
    print(d)
    print(e)
    print(filters)
    data = []
    condition = ""
    if target:
        condition += " and (name like '%{0}%') ".format(target)

    if 'customer_name' in filters:
        condition += " and customer_name like '{0}' ".format(filters['customer_name'][1])

    if "staffing_type" in filters:
        condition += get_condition(filters)

    if "start_date" in filters:
        condition += " and start_date = '{0}' ".format(filters['start_date'])

    if "supplier_name" in filters:
        condition += " and supplier_name like '{0}' ".format(filters['supplier_name'][1])

    if "employee_name" in filters:
        condition += " and (employee_name like '{0}' or staff_name like '{1}') ".format(filters['employee_name'][1],filters['employee_name'][1])

    time_list = ""
    if "doctype" in filters:
        time_list += " and parenttype = '{0}'".format(filters['doctype'])

    print(condition)
    query = """ SELECT * FROM `tabTimesy` WHERE docstatus=1 and status='Completed' {0}""".format(condition)
    print(query)
    staffing = frappe.db.sql(query, as_dict=1)
    for i in staffing:
        check = frappe.db.sql(""" SELECT * FROm `tabTimesy List` WHERE timesy=%s {0}""".format(time_list), i.name, as_dict=1)
        if len(check) == 0:
            data.append({
                "name": i.name,
                "staffing_type": i.staffing_type,
                "employee_name": i.staff_name if i.reference_type == 'Staff' else i.employee_name,
                "customer_name": i.customer_name,
                "supplier_name": i.supplier_name,
                "start_date": i.start_date
            })
    print(data)
    return data


@frappe.whitelist()
def get_timesy(name):
    data = json.loads(name)
    timesies = []

    for i in data:
        timesies += frappe.db.sql(""" SELECT * FROM `tabTimesy` WHERE name=%s""", i, as_dict=1)
    return timesies