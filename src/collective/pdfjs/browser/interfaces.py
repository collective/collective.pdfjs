from zope.interface import Interface
from plone.supermodel import model


class ICollectivePdfjsLayer(Interface):
    """ A layer specific to this product.
        Is registered using browserlayer.xml
    """


# class IFile(model.Schema):
#     model.load('')
