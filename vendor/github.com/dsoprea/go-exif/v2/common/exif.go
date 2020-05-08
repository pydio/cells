package exifcommon

const (
	// IFD names. The paths that we referred to the IFDs with are comprised of
	// these.

	IfdStandard = "IFD"
	IfdExif     = "Exif"
	IfdGps      = "GPSInfo"
	IfdIop      = "Iop"

	// Tag IDs for child IFDs.

	IfdExifId = 0x8769
	IfdGpsId  = 0x8825
	IfdIopId  = 0xA005

	// Just a placeholder.

	IfdRootId = 0x0000

	// The paths of the standard IFDs expressed in the standard IFD-mappings
	// and as the group-names in the tag data.

	IfdPathStandard        = "IFD"
	IfdPathStandardExif    = "IFD/Exif"
	IfdPathStandardExifIop = "IFD/Exif/Iop"
	IfdPathStandardGps     = "IFD/GPSInfo"
)
