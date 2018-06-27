<?php
namespace Unit;

class DuoTest extends \PHPUnit_Framework_TestCase
{

    const IKEY = "DIXXXXXXXXXXXXXXXXXX";
    const SKEY = "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef";
    const AKEY = "useacustomerprovidedapplicationsecretkey";
    const USER = "testuser";


    public function setUp()
    {
        $request_sig = \Duo\Web::signRequest(
            self::IKEY,
            self::SKEY,
            self::AKEY,
            self::USER
        );
        list($duo_sig, $valid_app_sig) = explode(':', $request_sig);

        $request_sig = \Duo\Web::signRequest(
            self::IKEY,
            self::SKEY,
            "invalidinvalidinvalidinvalidinvalidinvalid",
            self::USER
        );
        list($duo_sig, $invalid_app_sig) = explode(':', $request_sig);

        $this->valid_app_sig = $valid_app_sig;
        $this->invalid_app_sig = $invalid_app_sig;
        $this->valid_future_response = "AUTH|dGVzdHVzZXJ8RElYWFhYWFhYWFhYWFhYWFhYWFh8MTYxNTcyNzI0Mw==|d20ad0d1e62d84b00a3e74ec201a5917e77b6aef";
    }

    public function testNonNull()
    {
        $this->assertNotEquals(
            \Duo\Web::signRequest(
                self::IKEY,
                self::SKEY,
                self::AKEY,
                self::USER
            ),
            null
        );
    }

    public function testEmptyUsername()
    {
        $this->assertEquals(
            \Duo\Web::signRequest(
                self::IKEY,
                self::SKEY,
                self::AKEY,
                ""
            ),
            \Duo\Web::ERR_USER
        );
    }

    public function testExtraSeparator()
    {
        $this->assertEquals(
            \Duo\Web::signRequest(
                self::IKEY,
                self::SKEY,
                self::AKEY,
                "in|valid"
            ),
            \Duo\Web::ERR_USER
        );
    }

    public function testInvalidIkey()
    {
        $this->assertEquals(
            \Duo\Web::signRequest(
                "invalid",
                self::SKEY,
                self::AKEY,
                self::USER
            ),
            \Duo\Web::ERR_IKEY
        );
    }

    public function testInvalidSkey()
    {
        $this->assertEquals(
            \Duo\Web::signRequest(
                self::IKEY,
                "invalid",
                self::AKEY,
                self::USER
            ),
            \Duo\Web::ERR_SKEY
        );
    }

    public function testInvalidAkey()
    {
        $this->assertEquals(
            \Duo\Web::signRequest(
                self::IKEY,
                self::SKEY,
                "invalid",
                self::USER
            ),
            \Duo\Web::ERR_AKEY
        );
    }

    public function testInvalidResponse()
    {
        $invalid_response = "AUTH|INVALID|SIG";
        $this->assertEquals(
            \Duo\Web::verifyResponse(
                self::IKEY,
                self::SKEY,
                self::AKEY,
                $invalid_response . ":" . $this->valid_app_sig
            ),
            null
        );
    }

    public function testExpiredResponse()
    {
        $expired_response = "AUTH|dGVzdHVzZXJ8RElYWFhYWFhYWFhYWFhYWFhYWFh8MTMwMDE1Nzg3NA==|cb8f4d60ec7c261394cd5ee5a17e46ca7440d702";
        $this->assertEquals(
            \Duo\Web::verifyResponse(
                self::IKEY,
                self::SKEY,
                self::AKEY,
                $expired_response . ":" . $this->valid_app_sig
            ),
            null
        );
    }

    public function testFutureResponse()
    {
        $this->assertEquals(
            \Duo\Web::verifyResponse(
                self::IKEY,
                self::SKEY,
                self::AKEY,
                $this->valid_future_response . ":" . $this->valid_app_sig
            ),
            self::USER
        );
    }

    public function testFutureInvalidResponse()
    {
        $this->assertEquals(
            \Duo\Web::verifyResponse(
                self::IKEY,
                self::SKEY,
                self::AKEY,
                $this->valid_future_response . ":" . $this->invalid_app_sig
            ),
            null
        );
    }

    public function testFutureInvalidParams()
    {
        $invalid_params = "APP|dGVzdHVzZXJ8RElYWFhYWFhYWFhYWFhYWFhYWFh8MTYxNTcyNzI0M3xpbnZhbGlkZXh0cmFkYXRh|7c2065ea122d028b03ef0295a4b4c5521823b9b5";
        $this->assertEquals(
            \Duo\Web::verifyResponse(
                self::IKEY,
                self::SKEY,
                self::AKEY,
                $this->valid_future_response . ":" . $invalid_params
            ),
            null
        );
    }

    public function testFutureInvalidResponseParams()
    {
        $invalid_response_params = "AUTH|dGVzdHVzZXJ8RElYWFhYWFhYWFhYWFhYWFhYWFh8MTYxNTcyNzI0M3xpbnZhbGlkZXh0cmFkYXRh|6cdbec0fbfa0d3f335c76b0786a4a18eac6cdca7";
        $this->assertEquals(
            \Duo\Web::verifyResponse(
                self::IKEY,
                self::SKEY,
                self::AKEY,
                $invalid_response_params . ":" . $this->valid_app_sig
            ),
            null
        );
    }

    public function testFutureResponseInvalidIkey()
    {
        $wrong_ikey = "DIXXXXXXXXXXXXXXXXXY";
        $this->assertEquals(
            \Duo\Web::verifyResponse(
                $wrong_ikey,
                self::SKEY,
                self::AKEY,
                $this->valid_future_response . ":" . $this->valid_app_sig
            ),
            null
        );
    }
}
