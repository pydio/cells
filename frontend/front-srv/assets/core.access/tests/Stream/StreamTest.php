<?php
namespace Pydio\Access\Core\Tests\Stream;

require __DIR__ . '/../../../../core/vendor/autoload.php';

include_once(__DIR__ . "/../../../../base.conf.php");

use PHPUnit_Framework_TestCase;
use Pydio\Access\Core\Model\Node;
use Pydio\Access\Core\Stream\Stream;
use Symfony\Component\Config\FileLocator;

/**
 * @covers GuzzleHttp\Stream\Stream
 */
class StreamTest extends PHPUnit_Framework_TestCase
{
    const RESOURCES_PATH = __DIR__;
    const RESOURCES_FILE = "test.json";

    // TESTS :
    // For the test to pass,
    // you need to create a mock api here http://www.mocky.io/
    // with this json in return {"test":"ok"}
    // and a Content-Length header of 13
    // and replace the id in the test.json file
    public function testConstructorInitializesProperties()
    {
        $node = new Node("pydio.dropbox://admin:Alanci3nn5@0/test");

        $stream = Stream::factory($node, [
            "api_url" => "http://www.mocky.io/v2/",
            "api_resources_path" => self::RESOURCES_PATH,
            "api_resources_file" => self::RESOURCES_FILE
        ]);

        $this->assertTrue($stream->isReadable());
        $this->assertTrue($stream->isWritable());
        $this->assertTrue($stream->isSeekable());
        $this->assertEquals('pydio.dropbox://admin:Alanci3nn5@0/test', $stream->getMetadata('uri'));
        $this->assertInternalType('array', $stream->getMetadata());
        $this->assertEquals(13, $stream->getSize());
        $this->assertFalse($stream->eof());

        $stream->close();
    }

    public function testStreamClosesHandleOnDestruct()
    {
        $node = new Node("pydio.dropbox://admin:Alanci3nn5@0/test");

        $stream = Stream::factory($node, [
            "api_resources_path" => self::RESOURCES_PATH,
            "api_resources_file" => self::RESOURCES_FILE
        ]);

        unset($stream);
        $this->assertFalse(is_resource($node));
    }

    public function testCloseClearProperties()
    {
        $node = new Node("pydio.dropbox://admin:Alanci3nn5@0/test");

        $stream = Stream::factory($node, [
            "api_resources_path" => self::RESOURCES_PATH,
            "api_resources_file" => self::RESOURCES_FILE
        ]);
        $stream->close();

        $this->assertEmpty($stream->getMetadata());
        $this->assertFalse($stream->isSeekable());
        $this->assertFalse($stream->isReadable());
        $this->assertFalse($stream->isWritable());
        $this->assertNull($stream->getSize());
    }

    public function testReturnsCustomMetadata()
    {
        $node = new Node("pydio.dropbox://admin:Alanci3nn5@0/test");

        $s = Stream::factory($node, [
            "api_resources_path" => self::RESOURCES_PATH,
            "api_resources_file" => self::RESOURCES_FILE,
            'metadata' => ['hwm' => 3]
        ]);
        $this->assertEquals(3, $s->getMetadata('hwm'));
        $this->assertArrayHasKey('hwm', $s->getMetadata());
    }
}
