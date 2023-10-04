const expect = require('chai').expect;
const jwt = require('jsonwebtoken');
const sinon = require('sinon');

const authMiddleware = require('../middleware/is-auth');

describe('Auth middleware', function() {

    it('should throw an error if no authorization header is present', function() {
        const req = {
            get: function() {
                return null;
            }
        }
    
        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw('Not autheticated.');
    })
    
    it('should throw an error if the authorization header is only one string', function() {
        const req = {
            get: function() {
                return 'xui';
            }
        }
    
        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
    })

    it('should yield a userId after decoding the token', function() {
        const req = {
            get: function() {
                return 'Bearer sadasdasasd';
            }
        }
        sinon.stub(jwt, 'verify');
        jwt.verify.returns({userId: 123});
        authMiddleware(req, {}, ()=>{});
        expect(req).to.have.property('userId');
        expect(req).to.have.property('userId', 123);
        expect(jwt.verify.called).to.be.true; // чи було викликано метод взагалі в authMiddleware
        jwt.verify.restore();
    })

    it('should throw an error if the token not verified', function() {
        const req = {
            get: function() {
                return 'Bearer xyz';
            }
        }

        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
    })

});

