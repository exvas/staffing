frappe.listview_settings['Workforce Mobilization'] = {
    add_fields:["status"],
    get_indicator:function(doc){
      if (doc.status === "Active") {
        return [("Active"), "green", "status,=,Active"];      
      }
      else if(doc.status === "Standby"){
        return [("Standby"), "red", "status,=,Standby"];
  
      }
	  else if(doc.status === "Released"){
        return [("Released"), "orange", "status,=,Released"];
  
      }
      else if(doc.status === "Completed"){
        return [("Completd"), "green", "status,=,Completed"];
  
      }
      
    },
    
  
    
  
      
  };