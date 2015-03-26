package io.pivotal.shekel.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class BuildNumberController {

	@Value("#{environment.VCAP_APPLICATION}")
	private String vcapApplication; 
	
	@RequestMapping(value="/buildnumber", method = RequestMethod.GET)
	public ResponseEntity<String> getBuildNumber() { 
		if ( null == vcapApplication ) {
			vcapApplication = "{ \"application_name\": \"local-dev\", \"application_uris\": [ \"localhost:8080\" ] }";
		}
		return new ResponseEntity<String>(vcapApplication, HttpStatus.OK);
	}
}
