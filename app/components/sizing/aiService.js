var aiService = shekelApp.factory('aiService', function ($rootScope) {
    var aiPacks = 1;

    function setAiPacks(pack) {
        aiPacks = pack;
    }

    function getAiPacks() {
        return aiPacks;
    }

    return {
        getAiPacks: getAiPacks,
        setAiPack: setAiPacks,
        getAiCount: function (){
            return this.getAiPacks() * 50;
        }
    }
});