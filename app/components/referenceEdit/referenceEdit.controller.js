/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
ReferenceEditController.$inject = ['reference', 'sources', 'openmrsRest', '$location', 'openmrsNotification'];

export default function ReferenceEditController (reference, sources, openmrsRest, $location, openmrsNotification ){

    var vm = this;
    
    vm.links = {};
    vm.links["Concept Dictionary"] = "";
    vm.links["Reference Term Management"] = "reference/";
    vm.links["Reference Term Form"] = "reference/"+reference.uuid;
    
    vm.save = save;
    vm.cancel = cancel;
    vm.retire = retire;
    vm.unretire = unretire;

    activate();

    function activate() {
        vm.reference = reference;
        vm.sources = sources.results;

        if(angular.isUndefined(vm.reference.uuid)){
            vm.reference.conceptSource = vm.sources[0]
        }
        if(angular.isDefined(vm.reference.auditInfo)&&
            angular.isUndefined(vm.reference.auditInfo.retireReason)){
            vm.reference.auditInfo.retireReason = "";
        }
        vm.reference.conceptSource = vm.reference.conceptSource;
        openmrsNotification.routeNotification();
    }

    function cancel () {
        $location.path('/reference');
    }

    function save() {
        vm.json = angular.toJson(vm.reference);
        openmrsRest.update('conceptreferenceterm', {uuid: vm.reference.uuid}, vm.json).then(handleSuccess, handleException);
    }

    function unretire() {
        openmrsRest.unretire('conceptreferenceterm', {uuid: vm.reference.uuid}).then(handleSuccess, handleException);
    }

    function retire() {
        openmrsRest.retire('conceptreferenceterm', {uuid: vm.reference.uuid}).then(handleSuccess, handleException);
    }
    
    

    /**
     * Logic for delete-alert component
     */

    vm.deleteForever = deleteForever;
    vm.showAlert = showAlert;
    vm.updateDeleteConfirmation = updateDeleteConfirmation;
    
    vm.deleteClicked = false;
    
    function deleteForever() {
        openmrsRest.remove('conceptreferenceterm', {uuid : vm.reference.uuid, purge : true}).then(
        	function(success)  {$location.path('/reference').search({successToast: vm.reference.code+" has been purged"});}, 
        	handleException);
    }
    function showAlert(item) {
        vm.deleteClicked = true;
    }
    function updateDeleteConfirmation(isConfirmed) {
        if (isConfirmed) {
            deleteForever();
        }
        vm.deleteClicked = false;
    }
    function handleSuccess(success){
    	$location.path('/reference').search({successToast: vm.reference.code+" has been saved"});
    }
    function handleException(exception){
        openmrsNotification.error(exception.data.error.message);
    }
}