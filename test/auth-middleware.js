import { expect } from "chai";
import sinon from 'sinon';
import jwt from "jsonwebtoken";

import isAuth from '../middleware/is-auth.js'

describe('Auth middleware', function() {

    it('should throw an error if no authorization header is present', function() {
        const req = {
            get: function() {
                return null;
            }
        }
    
        expect(isAuth.bind(this, req, {}, () => {})).to.throw('Not autheticated.');
    })
    
    it('should throw an error if the authorization header is only one string', function() {
        const req = {
            get: function() {
                return 'xui';
            }
        }
    
        expect(isAuth.bind(this, req, {}, () => {})).to.throw();
    })

    it('should yield a userId after decoding the token', function() {
        const req = {
            get: function() {
                return 'Bearer sadasdasasd';
            }
        }
        sinon.stub(jwt, 'verify');
        jwt.verify.returns({userId: 123});
        isAuth(req, {}, ()=>{});
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

        expect(isAuth.bind(this, req, {}, () => {})).to.throw();
    })

});

