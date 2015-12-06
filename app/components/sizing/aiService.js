var aiService = shekelApp.factory('aiService', function ($rootScope) {
    var aiPacks = 1;

    function setAiPacks(pack) {
        aiPacks = pack;
    }

    function getAiPacks() {
        return aiPacks;
    }


    return {
        aiPacks: getAiPacks,
        setAiPack: setAiPacks,
        getAiCount: function (){
            return this.aiPacks() * 50;
        }
    }
});